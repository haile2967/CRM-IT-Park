<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    /**
     * Authenticate user, issue Sanctum token with SEC-003, SEC-004 & SEC-005 compliance.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $request->ensureIsNotRateLimited();

        $user = User::with('role')->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            $request->hitRateLimit();

            throw ValidationException::withMessages([
                'email' => ['Invalid email or password.'],
            ]);
        }

        // SEC-005: Account Status & Deactivation check
        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Your account is inactive. Please contact the administrator.',
                'error_code' => 'ACCOUNT_INACTIVE',
            ], Response::HTTP_FORBIDDEN);
        }

        // Clear throttle on success
        $request->clearRateLimit();

        // Update last login timestamp
        $user->forceFill(['last_login_at' => now()])->save();

        // Issue Sanctum token
        $token = $user->createToken('crm-api-token')->plainTextToken;

        // Centralized audit trail
        AuditLogger::log('users', $user->user_id, 'login', null, null, null, $user->user_id);

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'token' => $token,
            'user' => [
                'user_id' => $user->user_id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status,
                'last_login_at' => $user->last_login_at?->toIso8601String(),
                'role' => $user->role ? [
                    'role_id' => $user->role->role_id,
                    'role_name' => $user->role->role_name,
                    'role_tier' => $user->role->role_tier,
                ] : null,
            ],
        ]);
    }

    /**
     * Terminate the authenticated user's current session token.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user) {
            AuditLogger::log('users', $user->user_id, 'logout');
            $user->currentAccessToken()?->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * Retrieve the current authenticated user's profile and permissions.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('role');

        return response()->json([
            'success' => true,
            'user' => [
                'user_id' => $user->user_id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status,
                'last_login_at' => $user->last_login_at?->toIso8601String(),
                'role' => $user->role ? [
                    'role_id' => $user->role->role_id,
                    'role_name' => $user->role->role_name,
                    'role_tier' => $user->role->role_tier,
                    'description' => $user->role->description,
                ] : null,
                'permissions' => [
                    'is_admin' => $user->isAdmin(),
                    'is_crm_manager' => $user->isCrmManager(),
                    'is_bdo' => $user->isBdo(),
                    'is_support_agent' => $user->isSupportAgent(),
                ],
            ],
        ]);
    }

    /**
     * Update authenticated user's personal profile information.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:50'],
        ]);

        $user->update($validated);

        AuditLogger::log('users', $user->user_id, 'update_profile', null, null, json_encode($validated));

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'user' => $user->fresh('role'),
        ]);
    }

    /**
     * Change authenticated user's password.
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        $user->forceFill([
            'password' => Hash::make($request->new_password),
        ])->save();

        AuditLogger::log('users', $user->user_id, 'change_password');

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.',
        ]);
    }
}
