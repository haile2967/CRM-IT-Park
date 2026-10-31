<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use App\Permissions\Modules\UserPermissions;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class RbacPhase5Test extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected Role $adminRole;
    protected Role $customRole;
    protected User $regularUser;

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
                'description' => 'Full administrative control',
                'role_tier' => 1,
                'is_system' => true,
                'guard_name' => 'web',
            ]
        );

        // Create Admin user
        $this->adminUser = User::factory()->create();
        $this->adminUser->syncRoles([$this->adminRole]);

        // Create a custom baseline role and a regular user
        $this->customRole = Role::create([
            'name' => 'Custom Support',
            'role_name' => 'Custom Support',
            'role_tier' => 4,
            'is_system' => false,
            'guard_name' => 'web',
        ]);

        $this->regularUser = User::factory()->create();
        $this->regularUser->syncRoles([$this->customRole]);
    }

    /**
     * 1. Privilege Escalation: Non-admin without roles.create cannot call POST /api/v1/roles.
     */
    public function test_non_admin_without_roles_create_cannot_create_roles(): void
    {
        $payload = [
            'name' => 'Escalated Manager Role',
            'permissions' => [UserPermissions::CREATE],
        ];

        $response = $this->actingAs($this->regularUser)
            ->postJson('/api/v1/roles', $payload);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('roles', ['name' => 'Escalated Manager Role']);
    }

    /**
     * 2. Non-admin WITH roles.create can create custom roles.
     */
    public function test_non_admin_with_roles_create_can_create_custom_role(): void
    {
        $this->customRole->givePermissionTo('roles.create');

        $payload = [
            'name' => 'Authorized Custom Role',
            'description' => 'Created by delegated authority',
            'role_tier' => 3,
            'permissions' => [UserPermissions::VIEW],
        ];

        $response = $this->actingAs($this->regularUser)
            ->postJson('/api/v1/roles', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('roles', ['name' => 'Authorized Custom Role']);
    }

    /**
     * 3. Security Audit: Direct API call to modify System Administrator fails with 403 Forbidden.
     */
    public function test_direct_api_call_to_modify_system_administrator_role_returns_403(): void
    {
        // Even admin cannot modify the immutable System Administrator role
        $response = $this->actingAs($this->adminUser)
            ->putJson("/api/v1/roles/{$this->adminRole->id}", [
                'name' => 'Tampered Root Admin',
                'description' => 'Malicious payload',
            ]);

        $response->assertStatus(403)
            ->assertJsonPath('success', false);

        $this->adminRole->refresh();
        $this->assertEquals('System Administrator', $this->adminRole->name);
    }

    /**
     * 4. Security Audit: Direct API call to delete System Administrator fails with 403 Forbidden.
     */
    public function test_direct_api_call_to_delete_system_administrator_role_returns_403(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->deleteJson("/api/v1/roles/{$this->adminRole->id}");

        $response->assertStatus(403)
            ->assertJsonPath('success', false);

        $this->assertDatabaseHas('roles', ['id' => $this->adminRole->id]);
    }

    /**
     * 5. Dynamic Permission Update: User immediately gains and loses access on role update.
     */
    public function test_user_immediately_gains_and_loses_access_when_role_permissions_are_updated(): void
    {
        // Step A: Initially, regular user cannot access GET /api/v1/users
        $response1 = $this->actingAs($this->regularUser)
            ->getJson('/api/v1/users');
        $response1->assertStatus(403);

        // Step B: Update role to grant users.view
        $this->customRole->givePermissionTo(UserPermissions::VIEW);

        // Refresh cached permissions for the authenticated model instance
        $this->regularUser->load('permissions', 'roles');

        // Step C: Regular user immediately gains access without application restart
        $response2 = $this->actingAs($this->regularUser)
            ->getJson('/api/v1/users');
        $response2->assertStatus(200);

        // Step D: Revoke users.view from the role
        $this->customRole->revokePermissionTo(UserPermissions::VIEW);
        $this->regularUser->load('permissions', 'roles');

        // Step E: Regular user immediately loses access
        $response3 = $this->actingAs($this->regularUser)
            ->getJson('/api/v1/users');
        $response3->assertStatus(403);
    }

    /**
     * 6. Cache Verification: Spatie permission registrar invalidates cache on permission changes.
     */
    public function test_spatie_permission_cache_invalidates_automatically_on_permission_sync(): void
    {
        $registrar = app(PermissionRegistrar::class);

        // Prime cache
        $cached1 = $registrar->getPermissions();
        $this->assertNotEmpty($cached1);

        // Add a brand-new permission
        $newPerm = Permission::findOrCreate('reports.audit_export', 'web');

        // Sync to custom role
        $this->customRole->syncPermissions([$newPerm]);

        // Registrar must re-resolve with the updated permission
        $this->assertTrue($this->customRole->hasPermissionTo('reports.audit_export'));
        $this->assertTrue($this->regularUser->hasPermissionTo('reports.audit_export'));
    }

    /**
     * 7. Legacy Decommissioning: Verify users table has no role_id column and CheckRole is deleted.
     */
    public function test_legacy_decommissioning_verification(): void
    {
        // Assert users table no longer contains role_id
        $this->assertFalse(Schema::hasColumn('users', 'role_id'));

        // Assert CheckRole middleware file and class are deleted
        $this->assertFalse(file_exists(app_path('Http/Middleware/CheckRole.php')));
        $this->assertFalse(class_exists(\App\Http\Middleware\CheckRole::class, false));

        // Assert User::role accessor resolves the Spatie primary role
        $this->assertNotNull($this->regularUser->role);
        $this->assertEquals('Custom Support', $this->regularUser->role->name);

        // Assert User model has no legacy role helper methods
        $this->assertFalse(method_exists($this->regularUser, 'isAdmin'));
        $this->assertFalse(method_exists($this->regularUser, 'isCrmManager'));
        $this->assertFalse(method_exists($this->regularUser, 'isBdo'));
    }
}

