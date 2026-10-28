<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
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
     * Change password for the currently authenticated user (Option B: revokes all tokens).
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password provided is incorrect.'],
            ]);
        }

        $user->forceFill([
            'password' => Hash::make($request->new_password),
        ])->saveQuietly();

        AuditLog::create([
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

        // Option B: Revoke all tokens to enforce immediate re-login
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password successfully updated. Please sign in with your new password.',
        ]);
    }
}
