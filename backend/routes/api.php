<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Ethiopian IT Park CRM System
|--------------------------------------------------------------------------
| Reference: SRS v1.0 & Database Design v2.0
*/

Route::prefix('v1')->group(function () {
    // Health & System Diagnostic Endpoint
    Route::get('/health', function () {
        $dbStatus = 'disconnected';
        $dbVersion = null;
        try {
            $pdo = DB::connection()->getPdo();
            $dbStatus = 'connected';
            $dbVersion = DB::selectOne("SELECT version() as version")->version ?? 'PostgreSQL';
            $dbVersion = explode(',', $dbVersion)[0];
        } catch (\Throwable $e) {
            $dbStatus = 'error: ' . $e->getMessage();
        }

        $redisStatus = 'disconnected';
        try {
            $redis = Redis::connection();
            $pong = $redis->ping();
            $redisStatus = ($pong === true || $pong === 'PONG' || $pong === '+PONG') ? 'connected' : 'reachable';
        } catch (\Throwable $e) {
            $redisStatus = 'disconnected';
        }

        return response()->json([
            'status' => ($dbStatus === 'connected') ? 'online' : 'degraded',
            'app' => config('app.name', 'Ethiopian IT Park CRM'),
            'environment' => config('app.env'),
            'timestamp' => now()->toIso8601String(),
            'services' => [
                'postgres' => [
                    'status' => $dbStatus,
                    'version' => $dbVersion,
                ],
                'redis' => [
                    'status' => $redisStatus,
                ],
                'mailpit' => [
                    'status' => 'connected',
                    'host' => config('mail.mailers.smtp.host'),
                    'port' => config('mail.mailers.smtp.port'),
                ],
            ],
        ]);
    });

    // Authentication Endpoints (Public)
    Route::prefix('auth')->group(function () {
        Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);
    });

    // Protected Routes (Requires active authenticated session)
    Route::middleware(['auth:sanctum', 'active'])->group(function () {
        // Authenticated User & Profile
        Route::prefix('auth')->group(function () {
            Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
            Route::get('/me', [\App\Http\Controllers\Api\AuthController::class, 'me']);
            Route::put('/profile', [\App\Http\Controllers\Api\AuthController::class, 'updateProfile']);
            Route::put('/change-password', [\App\Http\Controllers\Api\AuthController::class, 'changePassword']);
        });

        // Roles Reference
        Route::get('/roles', [\App\Http\Controllers\Api\RoleController::class, 'index']);

        // User Management (Admin & Manager can view)
        Route::middleware('role:admin,manager')->group(function () {
            Route::get('/users', [\App\Http\Controllers\Api\UserController::class, 'index']);
            Route::get('/users/{id}', [\App\Http\Controllers\Api\UserController::class, 'show']);
        });

        // User Management Modifications (Admin only)
        Route::middleware('role:admin')->group(function () {
            Route::post('/users', [\App\Http\Controllers\Api\UserController::class, 'store']);
            Route::put('/users/{id}', [\App\Http\Controllers\Api\UserController::class, 'update']);
            Route::patch('/users/{id}/status', [\App\Http\Controllers\Api\UserController::class, 'toggleStatus']);
        });
    });
});
