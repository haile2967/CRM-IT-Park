<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\AbstractProvider;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

class SocialAuthTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Ensure default role exists
        Role::firstOrCreate(
            ['role_name' => 'Business Development Officer'],
            ['description' => 'BDO', 'role_tier' => 3]
        );
    }

    public function test_google_redirect_mode_json_returns_oauth_target_url(): void
    {
        $provider = Mockery::mock(AbstractProvider::class);
        $provider->shouldReceive('stateless')->andReturnSelf();
        $provider->shouldReceive('redirect->getTargetUrl')->andReturn('https://accounts.google.com/o/oauth2/v2/auth?client_id=test');

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $response = $this->getJson('/api/v1/auth/google/redirect?mode=json');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('url', 'https://accounts.google.com/o/oauth2/v2/auth?client_id=test');
    }

    public function test_google_callback_creates_new_user_and_issues_sanctum_token(): void
    {
        $socialiteUser = Mockery::mock(SocialiteUser::class);
        $socialiteUser->shouldReceive('getId')->andReturn('google-unique-id-999');
        $socialiteUser->shouldReceive('getEmail')->andReturn('newuser@example.com');
        $socialiteUser->shouldReceive('getName')->andReturn('Abebe Bikila');
        $socialiteUser->shouldReceive('getAvatar')->andReturn('https://lh3.googleusercontent.com/avatar.jpg');

        $provider = Mockery::mock(AbstractProvider::class);
        $provider->shouldReceive('stateless')->andReturnSelf();
        $provider->shouldReceive('user')->andReturn($socialiteUser);

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $response = $this->get('/api/v1/auth/google/callback');

        // Should redirect to frontend callback with token & success status
        $response->assertStatus(302);
        $targetUrl = $response->headers->get('Location');
        $this->assertStringContainsString('/auth/callback?token=', $targetUrl);
        $this->assertStringContainsString('status=success', $targetUrl);

        // Verify user in database
        $this->assertDatabaseHas('users', [
            'email' => 'newuser@example.com',
            'first_name' => 'Abebe',
            'last_name' => 'Bikila',
            'provider' => 'google',
            'provider_id' => 'google-unique-id-999',
            'status' => 'active',
        ]);

        // Verify audit log
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'oauth_login',
        ]);
    }

    public function test_google_callback_links_existing_user_by_email(): void
    {
        $role = Role::first();
        $existing = User::create([
            'first_name' => 'Almaz',
            'last_name' => 'Ayana',
            'email' => 'almaz@itpark.gov.et',
            'password' => bcrypt('Secret123!'),
            'role_id' => $role->id,
            'status' => 'active',
        ]);

        $socialiteUser = Mockery::mock(SocialiteUser::class);
        $socialiteUser->shouldReceive('getId')->andReturn('google-unique-id-888');
        $socialiteUser->shouldReceive('getEmail')->andReturn('almaz@itpark.gov.et');
        $socialiteUser->shouldReceive('getAvatar')->andReturn('https://lh3.googleusercontent.com/almaz.jpg');

        $provider = Mockery::mock(AbstractProvider::class);
        $provider->shouldReceive('stateless')->andReturnSelf();
        $provider->shouldReceive('user')->andReturn($socialiteUser);

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $response = $this->get('/api/v1/auth/google/callback');

        $response->assertStatus(302);
        $targetUrl = $response->headers->get('Location');
        $this->assertStringContainsString('/auth/callback?token=', $targetUrl);

        // Verify existing user was updated with provider details
        $existing->refresh();
        $this->assertEquals('google', $existing->provider);
        $this->assertEquals('google-unique-id-888', $existing->provider_id);
    }

    public function test_google_callback_blocks_deactivated_account(): void
    {
        $role = Role::first();
        User::create([
            'first_name' => 'Inactive',
            'last_name' => 'User',
            'email' => 'inactive@itpark.gov.et',
            'role_id' => $role->id,
            'provider' => 'google',
            'provider_id' => 'google-inactive-id',
            'status' => 'inactive',
        ]);

        $socialiteUser = Mockery::mock(SocialiteUser::class);
        $socialiteUser->shouldReceive('getId')->andReturn('google-inactive-id');
        $socialiteUser->shouldReceive('getEmail')->andReturn('inactive@itpark.gov.et');

        $provider = Mockery::mock(AbstractProvider::class);
        $provider->shouldReceive('stateless')->andReturnSelf();
        $provider->shouldReceive('user')->andReturn($socialiteUser);

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $response = $this->get('/api/v1/auth/google/callback');

        $response->assertStatus(302);
        $targetUrl = $response->headers->get('Location');
        $this->assertStringContainsString('status=error', $targetUrl);
        $this->assertStringContainsString('deactivated', urldecode($targetUrl));
    }
}
