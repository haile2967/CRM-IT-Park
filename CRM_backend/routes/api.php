<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EscalationPolicyController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\PipelineStageController;
use App\Http\Controllers\Api\ReferenceDataController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SocialAuthController;
use App\Http\Controllers\Api\TicketCategoryController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Ethiopian IT Park CRM System
|--------------------------------------------------------------------------
| Reference: SRS v1.0 & Database Design v2.0
*/

// Health & System Diagnostic Endpoint
Route::get('/health', function () {
    $dbStatus = 'disconnected';
    $dbVersion = null;
    try {
        DB::connection()->getPdo();
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

$registerRoutes = function () {
    // -------------------------------------------------------------------------
    // Authentication (Public)
    // -------------------------------------------------------------------------
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);

        // Social OAuth Authentication (Google, GitHub)
        Route::get('/{provider}/redirect', [SocialAuthController::class, 'redirect'])
            ->whereIn('provider', ['google', 'github']);
        Route::get('/{provider}/callback', [SocialAuthController::class, 'callback'])
            ->whereIn('provider', ['google', 'github']);

        Route::middleware(['auth:sanctum', 'active'])->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::put('/change-password', [AuthController::class, 'changePassword']);
        });
    });

    // -------------------------------------------------------------------------
    // Protected Routes (Requires active session)
    // -------------------------------------------------------------------------
    Route::middleware(['auth.keycloak', 'active'])->group(function () {

        // Pipeline Stages — Viewable by all authenticated CRM roles
        Route::get('/pipeline-stages', [PipelineStageController::class, 'index']);

        // Roles Reference — For assignment and filter dropdowns
        Route::get('/roles', [RoleController::class, 'index']);

        // Reference Data Dropdowns
        Route::get('/lead-sources', [ReferenceDataController::class, 'leadSources']);
        Route::get('/lead-categories', [ReferenceDataController::class, 'leadCategories']);

        // Leads Pipeline Management
        Route::prefix('leads')->group(function () {
            Route::get('/metrics', [LeadController::class, 'metrics']);
            Route::get('/check-duplicate', [LeadController::class, 'checkDuplicate']);
            Route::get('/', [LeadController::class, 'index']);
            Route::post('/', [LeadController::class, 'store']);
            Route::get('/{lead}', [LeadController::class, 'show']);
            Route::put('/{lead}', [LeadController::class, 'update']);
            Route::patch('/{lead}/status', [LeadController::class, 'updateStatus']);
            Route::patch('/{lead}/assign', [LeadController::class, 'assign']);
            Route::post('/{lead}/convert', [LeadController::class, 'convert']);
            Route::delete('/{lead}', [LeadController::class, 'destroy']);
        });
        // Ticket Categories — Listing & Details (Viewable by authenticated users)
        Route::get('/ticket-categories',                   [TicketCategoryController::class, 'index']);
        Route::get('/ticket-categories/{ticket_category}', [TicketCategoryController::class, 'show']);

        // User Management (Admin & Manager can view)
        Route::middleware('role:System Administrator,CRM Manager')->group(function () {
            Route::get('/users', [UserController::class, 'index']);
            Route::get('/users/{user}', [UserController::class, 'show']);
        });

        // Administration Routes (System Administrator only)
        Route::middleware('role:System Administrator')->group(function () {
            // User Management Mutations
            Route::prefix('users')->group(function () {
                Route::post('/', [UserController::class, 'store']);
                Route::put('/{user}', [UserController::class, 'update']);
                Route::patch('/{user}/status', [UserController::class, 'updateStatus']);
                Route::put('/{user}/role', [UserController::class, 'assignRole']);
            });

            // Pipeline Stage Management
            Route::prefix('pipeline-stages')->group(function () {
                Route::post('/', [PipelineStageController::class, 'store']);
                Route::put('/{stage}', [PipelineStageController::class, 'update']);
                Route::patch('/{stage}/status', [PipelineStageController::class, 'toggleStatus']);
                Route::post('/reorder', [PipelineStageController::class, 'reorder']);
                Route::delete('/{stage}', [PipelineStageController::class, 'destroy']);
            });

            // Escalation Policies & Ticket Reminder Thresholds
            Route::prefix('escalation-policies')->group(function () {
                Route::get('/', [EscalationPolicyController::class, 'index']);
                Route::post('/', [EscalationPolicyController::class, 'store']);
                Route::get('/{escalation_policy}', [EscalationPolicyController::class, 'show']);
                Route::put('/{escalation_policy}', [EscalationPolicyController::class, 'update']);
                Route::patch('/{escalation_policy}/reminder-threshold', [EscalationPolicyController::class, 'updateReminderThreshold']);
                Route::patch('/{escalation_policy}/status', [EscalationPolicyController::class, 'toggleStatus']);
                Route::delete('/{escalation_policy}', [EscalationPolicyController::class, 'destroy']);
            });

            // Ticket Category Management
            Route::prefix('ticket-categories')->group(function () {
                Route::post('/',                    [TicketCategoryController::class, 'store']);
                Route::put('/{ticket_category}',    [TicketCategoryController::class, 'update']);
                Route::delete('/{ticket_category}', [TicketCategoryController::class, 'destroy']);
            });
        });
    });
};

// Register routes under /api and /api/v1 for unified compatibility
Route::prefix('v1')->group($registerRoutes);
$registerRoutes();
