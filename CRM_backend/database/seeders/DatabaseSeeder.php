<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Roles are seeded via RoleSeeder, which uses the canonical role names
     * (e.g. "System Administrator") that the CheckRole middleware matches against.
     */
    public function run(): void
    {
        // 1. Seed all four canonical CRM roles first.
        $this->call(RoleSeeder::class);

        // 2. Seed the default SRS pipeline stages (New → Closed Lost).
        $this->call(PipelineStageSeeder::class);

        // 3. Seed Lead Sources, Categories, and initial Park Leads
        $this->call(LeadReferenceSeeder::class);

        // 4. Seed Canonical Users for Testing Assignment & RBAC
        $adminRole = \App\Models\Role::where('role_name', 'System Administrator')->first();
        $managerRole = \App\Models\Role::where('role_name', 'CRM Manager')->first();
        $bdoRole = \App\Models\Role::where('role_name', 'Business Development Officer')->first();

        User::updateOrCreate(
            ['email' => 'e9710092@gmail.com'],
            [
                'role_id'            => $adminRole->id,
                'first_name'         => 'System',
                'last_name'          => 'Admin',
                'phone'              => '+251911000000',
                'password'           => '12345678',
                'status'             => 'active',
                'email_verified_at'  => now(),
            ]
        );

        if ($managerRole) {
            User::updateOrCreate(
                ['email' => 'manager@itpark.gov.et'],
                [
                    'role_id'            => $managerRole->id,
                    'first_name'         => 'CRM',
                    'last_name'          => 'Manager',
                    'phone'              => '+251911111111',
                    'password'           => 'password',
                    'status'             => 'active',
                    'email_verified_at'  => now(),
                ]
            );
        }

        if ($bdoRole) {
            User::updateOrCreate(
                ['email' => 'habtamu.bdo@itpark.gov.et'],
                [
                    'role_id'            => $bdoRole->id,
                    'first_name'         => 'Habtamu',
                    'last_name'          => 'Kassahun',
                    'phone'              => '+251922222222',
                    'password'           => 'password',
                    'status'             => 'active',
                    'email_verified_at'  => now(),
                ]
            );
        }
    }
}
