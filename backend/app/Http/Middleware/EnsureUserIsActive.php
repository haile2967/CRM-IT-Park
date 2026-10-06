<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    /**
     * Handle an incoming request.
     * Enforces SEC-005: Account Status & Deactivation.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->status !== 'active') {
            // Revoke current token immediately
            $user->currentAccessToken()?->delete();

            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated. Please contact the System Administrator.',
                'error_code' => 'ACCOUNT_DEACTIVATED',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
