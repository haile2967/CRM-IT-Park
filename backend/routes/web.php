<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'system' => 'Ethiopian IT Park CRM — Backend Gateway',
        'version' => '1.0.0',
        'status' => 'operational',
        'docs' => [
            'api_health' => '/api/v1/health',
            'api_user' => '/api/v1/user',
        ],
        'frontend' => env('FRONTEND_URL', 'http://localhost:5174'),
    ]);
});
