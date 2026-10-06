<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class AuthAndRbacTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        RateLimiter::clear('test_throttle_key');
    }

    public function test_health_check_endpoint(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'online')
            ->assertJsonPath('services.postgres.status', 'connected');
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@itpark.gov.et',
            'password' => 'Admin@ITPark2026!',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'token',
                'user' => [
                    'user_id',
                    'name',
                    'email',
                    'role',
                ],
            ]);

        // Audit log was recorded
        $this->assertDatabaseHas('audit_logs', [
            'entity_type' => 'users',
            'action' => 'login',
        ]);
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@itpark.gov.et',
            'password' => 'WrongPassword123!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_rate_limiter_locks_out_after_five_failed_attempts(): void
    {
        $targetEmail = 'ratelimit_test@itpark.gov.et';

        // 5 consecutive failed attempts
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/v1/auth/login', [
                'email' => $targetEmail,
                'password' => 'WrongPassword!',
            ]);
            $response->assertStatus(422);
        }

        // 6th attempt must be locked out with HTTP 429
        $lockoutResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $targetEmail,
            'password' => 'WrongPassword!',
        ]);

        $lockoutResponse->assertStatus(429)
            ->assertJsonPath('errors.email.0', fn ($val) => str_contains($val, 'locked'));
    }

    public function test_inactive_user_cannot_login(): void
    {
        $user = User::where('email', 'bdo@itpark.gov.et')->first();
        $user->update(['status' => 'inactive']);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'bdo@itpark.gov.et',
            'password' => 'BDO@ITPark2026!',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('error_code', 'ACCOUNT_INACTIVE');

        // Restore status
        $user->update(['status' => 'active']);
    }

    public function test_authenticated_user_can_access_me_endpoint(): void
    {
        $admin = User::where('email', 'admin@itpark.gov.et')->first();

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.email', 'admin@itpark.gov.et')
            ->assertJsonPath('user.permissions.is_admin', true);
    }

    public function test_rbac_prevents_unauthorized_role_access(): void
    {
        $support = User::where('email', 'support@itpark.gov.et')->first();

        // Support Agent should be blocked from GET /api/v1/users
        $response = $this->actingAs($support, 'sanctum')->getJson('/api/v1/users');

        $response->assertStatus(403)
            ->assertJsonPath('success', false)
            ->assertJsonPath('user_role', 'Support Agent');
    }

    public function test_admin_can_access_user_management(): void
    {
        $admin = User::where('email', 'admin@itpark.gov.et')->first();

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/v1/users');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_admin_cannot_deactivate_self(): void
    {
        $admin = User::where('email', 'admin@itpark.gov.et')->first();

        $response = $this->actingAs($admin, 'sanctum')->patchJson("/api/v1/users/{$admin->user_id}/status");

        $response->assertStatus(422)
            ->assertJsonPath('message', 'You cannot deactivate your own account.');
    }
}
