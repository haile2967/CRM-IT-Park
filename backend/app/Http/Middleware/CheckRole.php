<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Map friendly role aliases to canonical database role names.
     */
    protected array $aliasMap = [
        'admin' => 'System Administrator',
        'administrator' => 'System Administrator',
        'system_administrator' => 'System Administrator',
        'manager' => 'CRM Manager',
        'crm_manager' => 'CRM Manager',
        'bdo' => 'Business Development Officer',
        'business_development_officer' => 'Business Development Officer',
        'support' => 'Support Agent',
        'support_agent' => 'Support Agent',
    ];

    /**
     * Handle an incoming request.
     * Enforces SEC-001 & §3.3 Role-Based Access Control.
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $userRole = $user->role?->role_name;

        if (!$userRole) {
            return response()->json([
                'success' => false,
                'message' => 'No role assigned to user.',
            ], Response::HTTP_FORBIDDEN);
        }

        // Normalize expected roles
        $allowedRoles = [];
        foreach ($roles as $role) {
            $normalized = strtolower(trim($role));
            $allowedRoles[] = $this->aliasMap[$normalized] ?? $role;
        }

        if (!in_array($userRole, $allowedRoles, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. You do not have the required role to access this resource.',
                'required_roles' => $allowedRoles,
                'user_role' => $userRole,
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
