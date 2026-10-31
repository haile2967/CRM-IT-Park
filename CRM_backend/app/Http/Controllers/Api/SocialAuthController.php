<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Supported OAuth providers.
     */
    protected array $supportedProviders = ['google', 'github'];

    /**
     * Redirect the user to the OAuth provider's consent page or return the URL for SPA.
     */
    public function redirect(Request $request, string $provider): JsonResponse|RedirectResponse
    {
        if (!in_array($provider, $this->supportedProviders, true)) {
            return response()->json([
                'success' => false,
                'message' => "Unsupported OAuth provider: {$provider}",
            ], 400);
        }

        try {
            /** @var \Laravel\Socialite\Two\AbstractProvider $driver */
            $driver = Socialite::driver($provider)->stateless();

            if ($provider === 'github') {
                $driver->scopes(['user:email', 'read:user']);
            }

            // If the frontend requests JSON (SPA), return the target URL directly
            if ($request->wantsJson() || $request->query('mode') === 'json') {
                return response()->json([
                    'success' => true,
                    'url' => $driver->redirect()->getTargetUrl(),
                ]);
            }

            return $driver->redirect();
        } catch (\Throwable $e) {
            Log::error("Social Auth Redirect Error [{$provider}]: " . $e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unable to initiate OAuth redirect: ' . $e->getMessage(),
                ], 500);
            }

            $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5174'), '/');
            return redirect()->to("{$frontendUrl}/auth/callback?error=" . urlencode($e->getMessage()) . "&status=error");
        }
    }

    /**
     * Handle the OAuth provider callback, authenticate or register the user, and issue a Sanctum token.
     */
    public function callback(Request $request, string $provider): RedirectResponse
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5174'), '/');

        if (!in_array($provider, $this->supportedProviders, true)) {
            return redirect()->to("{$frontendUrl}/auth/callback?error=" . urlencode("Unsupported provider: {$provider}") . "&status=error");
        }

        if ($request->has('error')) {
            $errorDescription = $request->get('error_description', $request->get('error'));
            return redirect()->to("{$frontendUrl}/auth/callback?error=" . urlencode($errorDescription) . "&status=error");
        }

        try {
            /** @var \Laravel\Socialite\Contracts\User $socialUser */
            $socialUser = Socialite::driver($provider)->stateless()->user();

            $email = $socialUser->getEmail();
            if (empty($email)) {
                if ($provider === 'github' && !empty($socialUser->getNickname())) {
                    $email = $socialUser->getNickname() . '@users.noreply.github.com';
                } else {
                    return redirect()->to("{$frontendUrl}/auth/callback?error=" . urlencode("Unable to retrieve email from {$provider}.") . "&status=error");
                }
            }

            // 1. Check if user already exists with this provider and ID
            $user = User::where('provider', $provider)
                ->where('provider_id', $socialUser->getId())
                ->first();

            // 2. If not found by provider ID, check by verified email
            if (!$user) {
                $user = User::where('email', $email)->first();

                if ($user) {
                    // Link existing email account to provider
                    $user->update([
                        'provider' => $provider,
                        'provider_id' => $socialUser->getId(),
                        'avatar' => $user->avatar ?: $socialUser->getAvatar(),
                        'email_verified_at' => $user->email_verified_at ?: now(),
                    ]);
                }
            }

            // 3. If user still does not exist, register a new account
            if (!$user) {
                $rawName = trim($socialUser->getName() ?: $socialUser->getNickname() ?: 'User');
                $nameParts = explode(' ', $rawName, 2);
                $firstName = $nameParts[0] ?: 'User';
                $lastName = $nameParts[1] ?? ($provider === 'google' ? 'Google' : 'GitHub');

                $defaultRole = Role::where('role_name', 'Business Development Officer')->first()
                    ?? Role::first();

                $user = User::create([
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'email' => $email,
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                    'avatar' => $socialUser->getAvatar(),
                    'status' => 'active',
                    'email_verified_at' => now(),
                ]);

                if ($defaultRole) {
                    $user->syncRoles([$defaultRole]);
                }
            }

            // 4. Check if account is active
            if ($user->status !== 'active') {
                return redirect()->to("{$frontendUrl}/auth/callback?error=" . urlencode('This account has been deactivated. Please contact an administrator.') . "&status=error");
            }

            // 5. Update last login timestamp
            $user->forceFill([
                'last_login_at' => now(),
            ])->saveQuietly();

            // 6. Record audit log
            AuditLog::create([
                'user_id' => $user->id,
                'action' => 'oauth_login',
                'entity_type' => 'User',
                'entity_id' => $user->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'details' => json_encode([
                    'provider' => $provider,
                    'email' => $user->email,
                ]),
            ]);

            // 7. Issue Sanctum token
            $token = $user->createToken('crm-session')->plainTextToken;

            // 8. Encode user profile for instant frontend session sync
            $userResource = (new UserResource($user->load('roles.permissions')))->toArray($request);
            $encodedUser = urlencode(base64_encode(json_encode($userResource)));

            // 9. Redirect back to frontend OAuth callback route
            return redirect()->to("{$frontendUrl}/auth/callback?token={$token}&user={$encodedUser}&status=success");

        } catch (\Throwable $e) {
            Log::error("Social Auth Callback Error [{$provider}]: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->to("{$frontendUrl}/auth/callback?error=" . urlencode($e->getMessage()) . "&status=error");
        }
    }
}
