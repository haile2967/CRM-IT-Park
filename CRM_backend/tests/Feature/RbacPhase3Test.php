<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use App\Permissions\Modules\UserPermissions;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class RbacPhase3Test extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected Role $adminRole;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed core permissions
        Permission::findOrCreate(UserPermissions::VIEW, 'web');
        Permission::findOrCreate(UserPermissions::CREATE, 'web');
        Permission::findOrCreate(UserPermissions::EDIT, 'web');
        Permission::findOrCreate(UserPermissions::DEACTIVATE, 'web');
        Permission::findOrCreate(UserPermissions::ASSIGN_ROLE, 'web');
        Permission::findOrCreate('roles.view', 'web');
        Permission::findOrCreate('roles.create', 'web');
        Permission::findOrCreate('roles.edit', 'web');
        Permission::findOrCreate('roles.delete', 'web');

        // Create System Administrator role
        $this->adminRole = Role::firstOrCreate(
            ['name' => 'System Administrator'],
            [
                'role_name' => 'System Administrator',
                'description' => 'Full administrative access',
                'role_tier' => 1,
                'is_system' => true,
                'guard_name' => 'web',
            ]
        );

        // Create Admin user
        $this->adminUser = User::factory()->create([
            'role_id' => $this->adminRole->id,
        ]);
        $this->adminUser->syncRoles([$this->adminRole]);
    }

    public function test_permission_discovery_endpoint_returns_grouped_catalog(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/v1/permissions');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'name',
                        'permissions' => [
                            '*' => ['name', 'description'],
                        ],
                    ],
                ],
            ]);
    }

    public function test_roles_index_returns_roles_with_permissions_and_user_counts(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/v1/roles');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'role_name',
                        'is_system',
                        'user_count',
                        'permissions',
                    ],
                ],
            ]);
    }

    public function test_can_create_custom_role_with_permissions(): void
    {
        $payload = [
            'name' => 'Custom Support Specialist',
            'description' => 'Handles tenant requests',
            'role_tier' => 4,
            'permissions' => [UserPermissions::VIEW],
        ];

        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/v1/roles', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('roles', ['name' => 'Custom Support Specialist']);

        $role = Role::where('name', 'Custom Support Specialist')->first();
        $this->assertTrue($role->hasPermissionTo(UserPermissions::VIEW, 'web'));
    }

    public function test_can_update_custom_role_and_sync_permissions(): void
    {
        $role = Role::create([
            'name' => 'Custom Editor',
            'role_name' => 'Custom Editor',
            'description' => 'Initial',
            'role_tier' => 3,
            'is_system' => false,
            'guard_name' => 'web',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->putJson("/api/v1/roles/{$role->id}", [
                'name' => 'Custom Senior Editor',
                'description' => 'Updated Description',
                'permissions' => [UserPermissions::VIEW, UserPermissions::EDIT],
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('roles', ['name' => 'Custom Senior Editor']);

        $role->refresh();
        $this->assertTrue($role->hasPermissionTo(UserPermissions::EDIT, 'web'));
    }

    public function test_cannot_update_system_administrator_role(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->putJson("/api/v1/roles/{$this->adminRole->id}", [
                'name' => 'Renamed Admin',
            ]);

        $response->assertStatus(403);
    }

    public function test_cannot_delete_system_administrator_role(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->deleteJson("/api/v1/roles/{$this->adminRole->id}");

        $response->assertStatus(403);
    }

    public function test_cannot_delete_role_with_active_users(): void
    {
        $role = Role::create([
            'name' => 'Operational Staff',
            'role_name' => 'Operational Staff',
            'is_system' => false,
            'guard_name' => 'web',
        ]);

        $staffUser = User::factory()->create(['role_id' => $role->id]);
        $staffUser->syncRoles([$role]);

        $response = $this->actingAs($this->adminUser)
            ->deleteJson("/api/v1/roles/{$role->id}");

        $response->assertStatus(403);
    }

    public function test_can_delete_unassigned_custom_role(): void
    {
        $role = Role::create([
            'name' => 'Unused Role',
            'role_name' => 'Unused Role',
            'is_system' => false,
            'guard_name' => 'web',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->deleteJson("/api/v1/roles/{$role->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('roles', ['id' => $role->id]);
    }

    public function test_non_admin_cannot_assign_system_administrator_role(): void
    {
        $managerRole = Role::create([
            'name' => 'Manager Role',
            'role_name' => 'Manager Role',
            'is_system' => false,
            'guard_name' => 'web',
        ]);
        $managerRole->givePermissionTo(UserPermissions::ASSIGN_ROLE);

        $managerUser = User::factory()->create(['role_id' => $managerRole->id]);
        $managerUser->syncRoles([$managerRole]);

        $targetUser = User::factory()->create(['role_id' => $managerRole->id]);

        $response = $this->actingAs($managerUser)
            ->putJson("/api/v1/users/{$targetUser->id}/role", [
                'role_id' => $this->adminRole->id,
            ]);

        $response->assertStatus(403);
    }
}
