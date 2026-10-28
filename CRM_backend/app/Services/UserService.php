<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class UserService
{
    /**
     * Create a new CRM user with an assigned role.
     */
    public function createUser(array $data): User
    {
        $user = User::create([
            'role_id'    => $data['role_id'],
            'first_name' => $data['first_name'],
            'last_name'  => $data['last_name'],
            'email'      => $data['email'],
            'password'   => $data['password'],
            'phone'      => $data['phone'] ?? null,
            'status'     => 'active',
        ]);

        return $user->load('role');
    }

    /**
     * Update mutable profile fields for an existing user.
     */
    public function updateUser(User $user, array $data): User
    {
        $fillable = ['role_id', 'first_name', 'last_name', 'email', 'phone', 'status'];

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

        $user->update(array_intersect_key($data, array_flip($fillable)));

        return $user->load('role');
    }

    /**
     * Update user account status (active or inactive).
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

        return $user->load('role');
    }

    /**
     * Assign or change the role of a user.
     */
    public function assignRole(User $user, int $roleId): User
    {
        $user->update(['role_id' => $roleId]);

        return $user->load('role');
    }
}
