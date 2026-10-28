<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class KeycloakService
{
    protected string $baseUrl;
    protected string $realm;
    protected string $adminUser;
    protected string $adminPassword;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.keycloak.base_url', 'http://keycloak:8080'), '/');
        $this->realm = config('services.keycloak.realm', 'itpark-crm');
        $this->adminUser = config('services.keycloak.admin_user', env('KEYCLOAK_ADMIN', 'admin'));
        $this->adminPassword = config('services.keycloak.admin_password', env('KEYCLOAK_ADMIN_PASSWORD', 'admin123'));
    }

    /**
     * Obtain master realm admin access token.
     */
    public function getAdminToken(): string
    {
        $tokenUrl = "{$this->baseUrl}/realms/master/protocol/openid-connect/token";

        $response = Http::asForm()->post($tokenUrl, [
            'client_id'  => 'admin-cli',
            'username'   => $this->adminUser,
            'password'   => $this->adminPassword,
            'grant_type' => 'password',
        ]);

        if (! $response->successful()) {
            throw new RuntimeException("Failed to obtain Keycloak admin token from {$tokenUrl}: " . $response->body());
        }

        return (string) $response->json('access_token');
    }

    /**
     * Create user in Keycloak and assign realm role.
     *
     * @return string The created/existing Keycloak user UUID.
     */
    public function createUser(array $data, string $password, ?string $roleName = null): string
    {
        $adminToken = $this->getAdminToken();

        $payload = [
            'username'      => $data['email'],
            'email'         => $data['email'],
            'firstName'     => $data['first_name'] ?? '',
            'lastName'      => $data['last_name'] ?? '',
            'enabled'       => ($data['status'] ?? 'active') === 'active',
            'emailVerified' => true,
            'credentials'   => [
                [
                    'type'      => 'password',
                    'value'     => $password,
                    'temporary' => false,
                ],
            ],
        ];

        if (! empty($data['phone'])) {
            $payload['attributes'] = ['phone' => [$data['phone']]];
        }

        $res = Http::withToken($adminToken)
            ->post("{$this->baseUrl}/admin/realms/{$this->realm}/users", $payload);

        $keycloakId = null;

        if ($res->status() === 201) {
            $location = $res->header('Location');
            if ($location) {
                $keycloakId = substr(strrchr($location, '/'), 1);
            }
        } elseif ($res->status() === 409) {
            // User already exists in Keycloak: retrieve and synchronize password & details
            $existing = $this->findUserByEmail($data['email'], $adminToken);
            if ($existing && ! empty($existing['id'])) {
                $keycloakId = $existing['id'];
                $this->updatePassword($keycloakId, $password, $adminToken);
                $this->updateUser($keycloakId, $data, $adminToken);
            } else {
                throw new RuntimeException("User {$data['email']} already exists in Keycloak, but ID could not be retrieved.");
            }
        } else {
            throw new RuntimeException("Failed to create user in Keycloak ({$res->status()}): " . $res->body());
        }

        // Fallback search by email if Location header was missing or not returned
        if (! $keycloakId) {
            $existing = $this->findUserByEmail($data['email'], $adminToken);
            $keycloakId = $existing['id'] ?? null;
        }

        if (! $keycloakId) {
            throw new RuntimeException("User was registered in Keycloak for {$data['email']}, but UUID could not be resolved.");
        }

        // Assign realm role if specified
        if ($roleName) {
            try {
                $this->assignRole($keycloakId, $roleName, $adminToken);
            } catch (\Throwable $e) {
                Log::warning("Could not assign Keycloak role '{$roleName}' to user '{$keycloakId}': " . $e->getMessage());
            }
        }

        return $keycloakId;
    }

    /**
     * Find a user by exact email in Keycloak.
     */
    public function findUserByEmail(string $email, ?string $adminToken = null): ?array
    {
        $adminToken = $adminToken ?: $this->getAdminToken();

        $res = Http::withToken($adminToken)
            ->get("{$this->baseUrl}/admin/realms/{$this->realm}/users", [
                'email' => $email,
                'exact' => 'true',
            ]);

        if ($res->successful()) {
            $users = $res->json();
            return ! empty($users) ? $users[0] : null;
        }

        return null;
    }

    /**
     * Update user details in Keycloak.
     */
    public function updateUser(string $keycloakId, array $data, ?string $adminToken = null): void
    {
        $adminToken = $adminToken ?: $this->getAdminToken();

        $payload = [];
        if (isset($data['first_name'])) {
            $payload['firstName'] = $data['first_name'];
        }
        if (isset($data['last_name'])) {
            $payload['lastName'] = $data['last_name'];
        }
        if (isset($data['email'])) {
            $payload['email'] = $data['email'];
            $payload['username'] = $data['email'];
        }
        if (isset($data['status'])) {
            $payload['enabled'] = ($data['status'] === 'active');
        }
        if (isset($data['phone'])) {
            $payload['attributes'] = ['phone' => [$data['phone']]];
        }

        if (empty($payload)) {
            return;
        }

        $res = Http::withToken($adminToken)
            ->put("{$this->baseUrl}/admin/realms/{$this->realm}/users/{$keycloakId}", $payload);

        if (! $res->successful()) {
            throw new RuntimeException("Failed to update user {$keycloakId} in Keycloak: " . $res->body());
        }
    }

    /**
     * Reset password for user in Keycloak.
     */
    public function updatePassword(string $keycloakId, string $newPassword, ?string $adminToken = null): void
    {
        $adminToken = $adminToken ?: $this->getAdminToken();

        $res = Http::withToken($adminToken)
            ->put("{$this->baseUrl}/admin/realms/{$this->realm}/users/{$keycloakId}/reset-password", [
                'type'      => 'password',
                'value'     => $newPassword,
                'temporary' => false,
            ]);

        if (! $res->successful()) {
            throw new RuntimeException("Failed to reset password for user {$keycloakId} in Keycloak: " . $res->body());
        }
    }

    /**
     * Update active / inactive status in Keycloak.
     */
    public function setUserStatus(string $keycloakId, bool $enabled, ?string $adminToken = null): void
    {
        $adminToken = $adminToken ?: $this->getAdminToken();

        $res = Http::withToken($adminToken)
            ->put("{$this->baseUrl}/admin/realms/{$this->realm}/users/{$keycloakId}", [
                'enabled' => $enabled,
            ]);

        if (! $res->successful()) {
            throw new RuntimeException("Failed to update status for user {$keycloakId} in Keycloak: " . $res->body());
        }
    }

    /**
     * Assign a realm role to a user in Keycloak and remove previous CRM roles.
     */
    public function assignRole(string $keycloakId, string $roleName, ?string $adminToken = null): void
    {
        $adminToken = $adminToken ?: $this->getAdminToken();

        // 1. Fetch role representation from Keycloak
        $roleRes = Http::withToken($adminToken)
            ->get("{$this->baseUrl}/admin/realms/{$this->realm}/roles/{$roleName}");

        if (! $roleRes->successful()) {
            Log::warning("Keycloak role '{$roleName}' not found in realm {$this->realm}");
            return;
        }

        $roleData = $roleRes->json();

        // 2. Fetch existing realm roles for user to remove previous CRM roles
        $userRolesRes = Http::withToken($adminToken)
            ->get("{$this->baseUrl}/admin/realms/{$this->realm}/users/{$keycloakId}/role-mappings/realm");

        if ($userRolesRes->successful() && is_array($userRolesRes->json())) {
            $crmRoles = ['System Administrator', 'CRM Manager', 'Support Agent', 'Business Development Officer'];
            $rolesToRemove = array_values(array_filter($userRolesRes->json(), function ($r) use ($crmRoles, $roleName) {
                return in_array($r['name'] ?? '', $crmRoles) && ($r['name'] !== $roleName);
            }));

            if (! empty($rolesToRemove)) {
                Http::withToken($adminToken)
                    ->delete("{$this->baseUrl}/admin/realms/{$this->realm}/users/{$keycloakId}/role-mappings/realm", $rolesToRemove);
            }
        }

        // 3. Add the target role
        $assignRes = Http::withToken($adminToken)
            ->post("{$this->baseUrl}/admin/realms/{$this->realm}/users/{$keycloakId}/role-mappings/realm", [
                [
                    'id'   => $roleData['id'],
                    'name' => $roleData['name'],
                ],
            ]);

        if (! $assignRes->successful()) {
            throw new RuntimeException("Failed to assign Keycloak role {$roleName}: " . $assignRes->body());
        }
    }
}
