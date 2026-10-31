<?php

use App\Models\User;
use App\Services\KeycloakService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('keycloak:sync-user {email} {password}', function (string $email, string $password, KeycloakService $keycloakService) {
    $user = User::with('roles')->where('email', $email)->first();

    if (! $user) {
        $this->error("User with email {$email} not found in CRM database.");
        return 1;
    }

    $this->info("Synchronizing user {$email} to Keycloak realm...");

    try {
        $roleName = $user->role?->role_name;
        $keycloakId = $keycloakService->createUser([
            'email'      => $user->email,
            'first_name' => $user->first_name,
            'last_name'  => $user->last_name,
            'status'     => $user->status,
            'phone'      => $user->phone,
        ], $password, $roleName);

        $user->update(['keycloak_id' => $keycloakId]);

        $this->info("✓ Successfully provisioned user {$email} in Keycloak!");
        $this->line("  Keycloak ID: {$keycloakId}");
        $this->line("  Role: " . ($roleName ?: 'None'));
        $this->line("  Credentials are now active. You can log in via Keycloak.");
        return 0;
    } catch (\Throwable $e) {
        $this->error("Failed to sync user to Keycloak: " . $e->getMessage());
        return 1;
    }
})->purpose('Provision or update a CRM user in Keycloak with their password and role');

Artisan::command('keycloak:sync-all {defaultPassword=Password123!}', function (string $defaultPassword, KeycloakService $keycloakService) {
    $users = User::with('roles')->get();

    $this->info("Found {$users->count()} users in CRM database. Synchronizing to Keycloak (Default password: {$defaultPassword})...");

    $successCount = 0;
    foreach ($users as $user) {
        try {
            $roleName = $user->role?->role_name;
            $keycloakId = $keycloakService->createUser([
                'email'      => $user->email,
                'first_name' => $user->first_name,
                'last_name'  => $user->last_name,
                'status'     => $user->status,
                'phone'      => $user->phone,
            ], $defaultPassword, $roleName);

            $user->update(['keycloak_id' => $keycloakId]);
            $this->line("✓ Synced {$user->email} (Keycloak ID: {$keycloakId}, Role: " . ($roleName ?: 'None') . ")");
            $successCount++;
        } catch (\Throwable $e) {
            $this->error("✗ Failed to sync {$user->email}: " . $e->getMessage());
        }
    }

    $this->info("Sync completed: {$successCount}/{$users->count()} users active in Keycloak.");
})->purpose('Synchronize all existing CRM database users to Keycloak');
