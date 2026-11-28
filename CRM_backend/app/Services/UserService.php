<?php

namespace App\Services;

use App\Http\Middleware\AuthenticateWithKeycloak;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserService
{
    public function __construct(private readonly KeycloakService $keycloakService) {}

    /**
     * Create a new CRM user with an assigned role and provision them into Keycloak IAM.
     */
    public function createUser(array $data): User
    {
        $role = Role::find($data['role_id']);
        $roleName = $role?->role_name;

        $keycloakId = null;

        // 1. Provision user in Keycloak IAM
        try {
            $keycloakId = $this->keycloakService->createUser($data, $data['password'], $roleName);
        } catch (\Throwable $e) {
            Log::error("Failed to provision user in Keycloak: " . $e->getMessage(), [
                'email' => $data['email'],
            ]);
            throw new \RuntimeException("Unable to create user in Keycloak IAM: " . $e->getMessage(), 0, $e);
        }

        // 2. Persist in CRM database with linked keycloak_id
        $user = User::create([
            'keycloak_id' => $keycloakId,
            'first_name'  => $data['first_name'],
            'last_name'   => $data['last_name'],
            'email'       => $data['email'],
            'password'    => $data['password'],
            'phone'       => $data['phone'] ?? null,
            'status'      => 'active',
        ]);

        if ($role) {
            $user->syncRoles([$role]);
        }

        AuthenticateWithKeycloak::forgetUserCache($user);
        return $user->load('roles.permissions');
    }

    /**
     * Update mutable profile fields for an existing user and sync to Keycloak.
     */
    public function updateUser(User $user, array $data): User
    {
        $fillable = ['first_name', 'last_name', 'email', 'phone', 'status', 'role_id'];

        if (isset($data['password'])) {
            $fillable[] = 'password';
        }

        if (isset($data['status'])) {
            if ($data['status'] === 'inactive') {
                $data['deactivated_at'] = now();
                $fillable[] = 'deactivated_at';
            } elseif ($data['status'] === 'active') {
                $data['deactivated_at'] = null;
                $fillable[] = 'deactivated_at';
            }
        }

        $targetRole = isset($data['role_id']) ? Role::find($data['role_id']) : null;
        $roleChanged = $targetRole && (
            (int) $user->role_id !== (int) $targetRole->id
            || ! $user->hasRole($targetRole->name)
        );

        $user->update(array_intersect_key($data, array_flip($fillable)));

        // Synchronize role in local CRM database (Spatie pivot table)
        if ($targetRole && $roleChanged) {
            $user->syncRoles([$targetRole]);
        }

        // Only push actually modified profile fields to Keycloak
        $keycloakPayload = [];
        foreach (['first_name', 'last_name', 'email', 'phone', 'status'] as $field) {
            if ($user->wasChanged($field)) {
                $keycloakPayload[$field] = $user->{$field};
            }
        }

        // Synchronize updates to Keycloak only when something relevant changed
        if (! empty($keycloakPayload) || isset($data['password']) || $roleChanged) {
            $keycloakId = $user->keycloak_id;
            if (! $keycloakId) {
                $existing = $this->keycloakService->findUserByEmail($user->email);
                if ($existing && ! empty($existing['id'])) {
                    $keycloakId = $existing['id'];
                    $user->update(['keycloak_id' => $keycloakId]);
                }
            }

            if ($keycloakId) {
                try {
                    if (! empty($keycloakPayload)) {
                        $this->keycloakService->updateUser($keycloakId, $keycloakPayload);
                    }

                    if (isset($data['password'])) {
                        $this->keycloakService->updatePassword($keycloakId, $data['password']);
                    }

                    if ($roleChanged && $targetRole) {
                        $this->keycloakService->assignRole($keycloakId, $targetRole->role_name);
                    }
                } catch (\Throwable $e) {
                    Log::error("Failed to sync updated user {$user->id} to Keycloak: " . $e->getMessage());
                }
            }
        }

        AuthenticateWithKeycloak::forgetUserCache($user);
        $user->unsetRelation('roles');
        return $user->load('roles.permissions');
    }

    /**
     * Update user account status (active or inactive) and sync to Keycloak.
     */
    public function setStatus(User $user, string $status): User
    {
        DB::transaction(function () use ($user, $status) {
            if ($status === 'inactive') {
                $user->update([
                    'status'         => 'inactive',
                    'deactivated_at' => now(),
                ]);

                // Revoke all active Sanctum tokens so the session ends immediately.
                $user->tokens()->delete();
            } else {
                $user->update([
                    'status'         => 'active',
                    'deactivated_at' => null,
                ]);
            }
        });

        // Sync enabled state in Keycloak
        $keycloakId = $user->keycloak_id;
        if (! $keycloakId) {
            $existing = $this->keycloakService->findUserByEmail($user->email);
            if ($existing && ! empty($existing['id'])) {
                $keycloakId = $existing['id'];
                $user->update(['keycloak_id' => $keycloakId]);
            }
        }

        if ($keycloakId) {
            try {
                $this->keycloakService->setUserStatus($keycloakId, $status === 'active');
            } catch (\Throwable $e) {
                Log::error("Failed to sync user status to Keycloak: " . $e->getMessage());
            }
        }

        AuthenticateWithKeycloak::forgetUserCache($user);
        return $user->load('roles.permissions');
    }

    /**
     * Assign or change the role of a user and sync to Keycloak.
     */
    public function assignRole(User $user, int $roleId): User
    {
        $role = Role::find($roleId);

        if ($role) {
            $user->syncRoles([$role]);
        }

        $keycloakId = $user->keycloak_id;
        if (! $keycloakId) {
            $existing = $this->keycloakService->findUserByEmail($user->email);
            if ($existing && ! empty($existing['id'])) {
                $keycloakId = $existing['id'];
                $user->update(['keycloak_id' => $keycloakId]);
            }
        }

        if ($keycloakId && $role) {
            try {
                $this->keycloakService->assignRole($keycloakId, $role->role_name);
            } catch (\Throwable $e) {
                Log::error("Failed to sync role change to Keycloak: " . $e->getMessage());
            }
        }

        AuthenticateWithKeycloak::forgetUserCache($user);
        return $user->load('roles.permissions');
    }
}
