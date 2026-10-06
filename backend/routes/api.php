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

    // Authenticated User Profile
    Route::get('/user', function (Request $request) {
        return $request->user();
    })->middleware('auth:sanctum');
});
