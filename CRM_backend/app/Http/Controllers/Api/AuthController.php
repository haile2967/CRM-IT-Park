<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\KeycloakService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(private readonly KeycloakService $keycloakService) {}

    /**
     * Authenticate a CRM user and issue a Sanctum Bearer token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $request->ensureIsNotRateLimited();

        $user = User::with('role')->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            RateLimiter::hit($request->throttleKey());

            throw ValidationException::withMessages([
                'email' => ['Invalid email or password'],
            ]);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'This account has been deactivated. Please contact a CRM administrator.',
            ], 403);
        }

        RateLimiter::clear($request->throttleKey());

        // Update login audit timestamp
        $user->forceFill([
            'last_login_at' => now(),
        ])->saveQuietly();

        // Issue standard Sanctum API Bearer Token
        $token = $user->createToken('crm-session')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Authentication successful',
            'data' => [
                'token' => $token,
                'token_type' => 'Bearer',
                'user' => new UserResource($user),
            ],
        ]);
    }

    /**
     * Return the currently authenticated user with role details.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('role');

        return response()->json([
            'success' => true,
            'data' => [
                'user' => new UserResource($user),
            ],
        ]);
    }

    /**
     * Revoke the user's active Sanctum access token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Change password for the currently authenticated user and sync to Keycloak.
     */
    public function changePassword(\App\Http\Requests\Auth\ChangePasswordRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        // 1. Verify current password if user has a hashed password
        if ($user->password && !Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password provided is incorrect.'],
            ]);
        }

        // 2. Sync password to Keycloak IAM if user has keycloak_id
        if ($user->keycloak_id) {
            try {
                $this->keycloakService->updatePassword($user->keycloak_id, $request->new_password);
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error("Keycloak password sync failed: " . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Unable to update password in Keycloak IAM: ' . $e->getMessage(),
                ], 500);
            }
        }

        // 3. Update local PostgreSQL password hash
        $user->forceFill([
            'password' => Hash::make($request->new_password),
        ])->saveQuietly();

        \App\Models\AuditLog::create([
            'user_id' => $user->id,
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'action' => 'password_changed',
            'field_name' => 'password',
            'old_value' => null,
            'new_value' => '******',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password successfully updated. Please sign in with your new password.',
        ]);
    }
}
