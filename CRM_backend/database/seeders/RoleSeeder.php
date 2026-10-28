<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'role_name' => 'System Administrator',
                'description' => 'Full administrative control and system configuration',
                'role_tier' => 1,
                'is_active' => true,
            ],
            [
                'role_name' => 'CRM Manager',
                'description' => 'Oversees CRM operations, team pipelines, approvals, and reporting',
                'role_tier' => 2,
                'is_active' => true,
            ],
            [
                'role_name' => 'Business Development Officer',
                'description' => 'Manages leads, accounts, contacts, and opportunities',
                'role_tier' => 3,
                'is_active' => true,
            ],
            [
                'role_name' => 'Support Agent',
                'description' => 'Handles support tickets, customer queries, and issue resolutions',
                'role_tier' => 4,
                'is_active' => true,
            ],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(
                ['role_name' => $role['role_name']],
                $role
            );
        }
    }
}
