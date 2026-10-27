<?php

namespace App\Http\Middleware;

use App\Models\Role;
use App\Models\User;
use Closure;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateWithKeycloak
{
    /**
     * Handle an incoming request by validating Keycloak JWT and JIT syncing the user.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        if (! $token) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        try {
            // 1. Fetch Keycloak Public JWKS Keys (Cached for 1 hour)
            $jwks = Cache::remember('keycloak_jwks', 3600, function () {
                $url = rtrim(config('services.keycloak.realm_url'), '/') . '/protocol/openid-connect/certs';
                $response = Http::timeout(5)->get($url);

                if (! $response->successful()) {
                    throw new \RuntimeException("Unable to fetch Keycloak public JWKS keys from {$url}");
                }

                return $response->json();
            });

            // 2. Parse keys and decode token
            $parsedKeys = JWK::parseKeySet($jwks);
            $decoded = JWT::decode($token, $parsedKeys);

            // 3. Extract Claims
            $keycloakId = $decoded->sub ?? null;
            $email = $decoded->email ?? null;
            $firstName = $decoded->given_name ?? ($decoded->preferred_username ?? 'User');
            $lastName = $decoded->family_name ?? '';

            // Roles can be in realm_access or resource_access
            $realmRoles = (array) ($decoded->realm_access->roles ?? []);
            $clientId = config('services.keycloak.client_id', 'crm-frontend');
            $clientRoles = (array) ($decoded->resource_access?->{$clientId}?->roles ?? []);
            $roles = array_unique(array_merge($realmRoles, $clientRoles));

            // 4. Resolve matching role in CRM database
            $matchedRole = Role::whereIn('role_name', $roles)->first()
                ?? Role::where('role_name', 'Support Agent')->first();

            // 5. Just-In-Time (JIT) Provisioning
            // Look up by keycloak_id first, then by email
            $user = null;
            if ($keycloakId) {
                $user = User::where('keycloak_id', $keycloakId)->first();
            }
            if (! $user && $email) {
                $user = User::where('email', $email)->first();
            }

            if ($user) {
                $user->update([
                    'keycloak_id' => $keycloakId,
                    'first_name'  => $firstName ?: $user->first_name,
                    'last_name'   => $lastName ?: $user->last_name,
                    'role_id'     => $matchedRole?->id ?? $user->role_id,
                    'last_login_at' => now(),
                ]);
            } else {
                $user = User::create([
                    'keycloak_id' => $keycloakId,
                    'email'       => $email,
                    'first_name'  => $firstName,
                    'last_name'   => $lastName,
                    'role_id'     => $matchedRole?->id,
                    'status'      => 'active',
                    'last_login_at' => now(),
                ]);
            }

            // 6. Check active status
            if ($user->status !== 'active') {
                return new \Illuminate\Http\JsonResponse([
                    'success' => false,
                    'message' => 'This account has been deactivated. Please contact a CRM administrator.',
                ], 403);
            }

            // 7. Bind authenticated user to Laravel request lifecycle
            $request->setUserResolver(fn () => $user);
            try {
                if (auth()->hasResolvedGuards() || app()->bound('auth')) {
                    auth()->setUser($user);
                }
            } catch (\Throwable) {
                // If container session guard request is not bound
            }

        } catch (\Throwable $e) {
            Log::warning('Keycloak JWT Authentication Failed', [
                'error' => $e->getMessage(),
                'ip'    => $request->ip(),
            ]);

            return new \Illuminate\Http\JsonResponse([
                'success' => false,
                'message' => 'Invalid or expired Keycloak token: ' . $e->getMessage(),
            ], 401);
        }

        return $next($request);
    }
}
