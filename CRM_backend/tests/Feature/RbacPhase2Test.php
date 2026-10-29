<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use App\Permissions\Modules\UserPermissions;
use App\Permissions\PermissionRegistry;
use App\Policies\RolePolicy;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class RbacPhase2Test extends TestCase
{
    public function test_super_admin_bypasses_all_gates_via_gate_before(): void
    {
        $adminRole = Role::firstOrCreate(['name' => 'System Administrator', 'guard_name' => 'web']);
        
        $adminUser = User::factory()->make();
        $adminUser->setRelation('roles', collect([$adminRole]));

        // Admin should automatically pass ANY arbitrary permission check via Gate::before
        $this->assertTrue($adminUser->can('random.nonexistent.permission'));
        $this->assertTrue($adminUser->can(UserPermissions::CREATE));
        $this->assertTrue($adminUser->can(UserPermissions::DEACTIVATE));
    }

    public function test_role_policy_blocks_updating_system_administrator(): void
    {
        $policy = new RolePolicy();
        $adminRole = Role::firstOrCreate(['name' => 'System Administrator', 'guard_name' => 'web']);
        $adminRole->is_system = true;

        $adminUser = User::factory()->make();
        $adminUser->setRelation('roles', collect([$adminRole]));

        // Even System Administrator cannot update or rename System Administrator role
        $this->assertFalse($policy->update($adminUser, $adminRole));
    }

    public function test_role_policy_blocks_deleting_system_administrator(): void
    {
        $policy = new RolePolicy();
        $adminRole = Role::firstOrCreate(['name' => 'System Administrator', 'guard_name' => 'web']);
        $adminRole->is_system = true;

        $adminUser = User::factory()->make();
        $adminUser->setRelation('roles', collect([$adminRole]));

        // System Administrator cannot be deleted
        $this->assertFalse($policy->delete($adminUser, $adminRole));
    }

    public function test_role_model_event_throws_exception_on_delete_system_admin(): void
    {
        $adminRole = Role::firstOrCreate(['name' => 'System Administrator', 'guard_name' => 'web']);
        $adminRole->is_system = true;

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('The System Administrator role is protected and cannot be deleted.');

        $adminRole->delete();
    }

    public function test_user_resource_hydrates_permissions_and_roles(): void
    {
        $adminRole = Role::firstOrCreate(['name' => 'System Administrator', 'guard_name' => 'web']);
        $user = User::factory()->make([
            'first_name' => 'Test',
            'last_name' => 'Admin',
            'email' => 'testadmin@itpark.et',
        ]);
        $user->setRelation('roles', collect([$adminRole]));
        $user->setRelation('role', $adminRole);

        $resource = (new \App\Http\Resources\UserResource($user))->toArray(request());

        $this->assertTrue($resource['is_admin']);
        $this->assertContains('System Administrator', $resource['roles']);
        // Admin gets all registered permissions
        $this->assertEquals(PermissionRegistry::allNames(), $resource['permissions']);
    }
}

