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
        // 1. Seed Initial System Administrator Role
        $this->call(RoleSeeder::class);

        // 2. Seed Initial System Administrator User
        $adminRole = \App\Models\Role::where('role_name', 'System Administrator')->first();

        if ($adminRole) {
            User::updateOrCreate(
                ['email' => 'e9710092@gmail.com'],
                [
                    'keycloak_id'        => '86bfbaca-47ba-443f-bc73-7f9259ba44f2',
                    'role_id'            => $adminRole->id,
                    'first_name'         => 'System',
                    'last_name'          => 'Admin',
                    'phone'              => '+251911000000',
                    'status'             => 'active',
                    'email_verified_at'  => now(),
                ]
            );
        }

        // 3. Seed the default SRS pipeline stages (New → Closed Lost).
        $this->call(PipelineStageSeeder::class);

        // 4. Seed Lead Sources, Categories, and initial Park Leads (assigned to admin)
        $this->call(LeadReferenceSeeder::class);
    }
}
