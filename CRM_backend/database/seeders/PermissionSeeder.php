<?php

namespace Database\Seeders;

use App\Permissions\PermissionRegistry;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Dynamically registers all permissions defined across modular domain classes.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Seed all permissions registered in the PermissionRegistry
        foreach (PermissionRegistry::all() as $perm) {
            Permission::firstOrCreate(
                ['name' => $perm['name'], 'guard_name' => 'web'],
                [
                    'group_name' => $perm['group'],
                    'guard_name' => 'web',
                ]
            );
        }

        // 2. Grant all registered permissions to the System Administrator role
        $adminRole = Role::where('name', 'System Administrator')->first();
        if ($adminRole) {
            $adminRole->givePermissionTo(PermissionRegistry::allNames());
        }
    }
}
