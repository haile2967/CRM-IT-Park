<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class HealthController extends Controller
{
    /**
     * Health & System Diagnostic Endpoint.
     */
    public function health(): JsonResponse
    {
        $dbStatus = 'disconnected';
        $dbVersion = null;
        try {
            DB::connection()->getPdo();
            $dbStatus = 'connected';
            $dbVersion = DB::selectOne('SELECT version() as version')->version ?? 'PostgreSQL';
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
    }

    /**
     * Root Gateway Endpoint.
     */
    public function gateway(): JsonResponse
    {
        return response()->json([
            'system' => 'Ethiopian IT Park CRM — Backend Gateway',
            'version' => '1.0.0',
            'status' => 'operational',
            'docs' => [
                'api_health' => '/api/v1/health',
                'api_user' => '/api/v1/user',
            ],
            'frontend' => config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5174')),
        ]);
    }
}
