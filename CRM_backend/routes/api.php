<?php

use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\OpportunityController;
use App\Http\Controllers\Api\EscalationPolicyController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\PipelineStageController;
use App\Http\Controllers\Api\ReferenceDataController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SocialAuthController;
use App\Http\Controllers\Api\TicketCategoryController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Ethiopian IT Park CRM System
|--------------------------------------------------------------------------
| Reference: SRS v1.0 & Database Design v2.0
*/

// Health & System Diagnostic Endpoint
Route::get('/health', [HealthController::class, 'health']);

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

        Route::middleware(['auth.keycloak', 'active'])->group(function () {
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

        // System Permissions Catalog
        Route::get('/permissions', [PermissionController::class, 'index']);

        // Roles & Permission Matrix Management
        Route::get('/roles', [RoleController::class, 'index']);
        Route::get('/roles/{role}', [RoleController::class, 'show']);
        Route::prefix('roles')->group(function () {
            Route::post('/', [RoleController::class, 'store'])->middleware('permission:roles.create');
            Route::put('/{role}', [RoleController::class, 'update'])->middleware('permission:roles.edit');
            Route::delete('/{role}', [RoleController::class, 'destroy'])->middleware('permission:roles.delete');
        });

        // Reference Data Dropdowns
        Route::get('/lead-sources', [ReferenceDataController::class, 'leadSources']);
        Route::get('/lead-categories', [ReferenceDataController::class, 'leadCategories']);
        Route::get('/account-types', [ReferenceDataController::class, 'accountTypes']);
        Route::get('/opportunity-types', [OpportunityController::class, 'types']);

        // Commercial Opportunities & Deals Pipeline
        Route::prefix('opportunities')->group(function () {
            Route::get('/metrics', [OpportunityController::class, 'metrics'])->middleware('permission:opportunities.view');
            Route::get('/kanban', [OpportunityController::class, 'kanban'])->middleware('permission:opportunities.view');
            Route::get('/', [OpportunityController::class, 'index'])->middleware('permission:opportunities.view');
            Route::post('/', [OpportunityController::class, 'store'])->middleware('permission:opportunities.create');
            Route::get('/{opportunity}', [OpportunityController::class, 'show'])->middleware('permission:opportunities.view');
            Route::put('/{opportunity}', [OpportunityController::class, 'update'])->middleware('permission:opportunities.edit');
            Route::patch('/{opportunity}/stage', [OpportunityController::class, 'transitionStage'])->middleware('permission:opportunities.edit');
            Route::patch('/{opportunity}/transfer-ownership', [OpportunityController::class, 'transferOwnership'])->middleware('permission:opportunities.edit');
            Route::delete('/{opportunity}', [OpportunityController::class, 'destroy'])->middleware('permission:opportunities.delete');
            Route::get('/{opportunity}/pms-export', [OpportunityController::class, 'exportPms'])->middleware('permission:opportunities.view');
        });

        // Accounts Management
        Route::prefix('accounts')->group(function () {
            Route::get('/metrics', [AccountController::class, 'metrics'])->middleware('permission:accounts.view');
            Route::get('/', [AccountController::class, 'index'])->middleware('permission:accounts.view');
            Route::post('/', [AccountController::class, 'store'])->middleware('permission:accounts.create');
            Route::get('/{account}', [AccountController::class, 'show'])->middleware('permission:accounts.view');
            Route::put('/{account}', [AccountController::class, 'update'])->middleware('permission:accounts.edit');
            Route::patch('/{account}/transfer-ownership', [AccountController::class, 'transferOwnership'])->middleware('permission:accounts.edit');
            Route::delete('/{account}', [AccountController::class, 'destroy'])->middleware('permission:accounts.delete');
        });

        // Contacts Management
        Route::prefix('contacts')->group(function () {
            Route::get('/', [ContactController::class, 'index'])->middleware('permission:contacts.view');
            Route::post('/', [ContactController::class, 'store'])->middleware('permission:contacts.create');
            Route::get('/{contact}', [ContactController::class, 'show'])->middleware('permission:contacts.view');
            Route::put('/{contact}', [ContactController::class, 'update'])->middleware('permission:contacts.edit');
            Route::patch('/{contact}/primary', [ContactController::class, 'setPrimary'])->middleware('permission:contacts.edit');
            Route::delete('/{contact}', [ContactController::class, 'destroy'])->middleware('permission:contacts.delete');
        });

        // Leads Pipeline Management
        Route::prefix('leads')->group(function () {
            Route::get('/metrics', [LeadController::class, 'metrics'])->middleware('permission:leads.view');
            Route::get('/check-duplicate', [LeadController::class, 'checkDuplicate'])->middleware('permission:leads.view|leads.create|leads.edit');
            Route::get('/', [LeadController::class, 'index'])->middleware('permission:leads.view');
            Route::post('/', [LeadController::class, 'store'])->middleware('permission:leads.create');
            Route::get('/{lead}', [LeadController::class, 'show'])->middleware('permission:leads.view');
            Route::put('/{lead}', [LeadController::class, 'update'])->middleware('permission:leads.edit');
            Route::patch('/{lead}/status', [LeadController::class, 'updateStatus'])->middleware('permission:leads.edit');
            Route::patch('/{lead}/assign', [LeadController::class, 'assign'])->middleware('permission:leads.assign');
            Route::post('/{lead}/convert', [LeadController::class, 'convert'])->middleware('permission:leads.convert');
            Route::delete('/{lead}', [LeadController::class, 'destroy'])->middleware('permission:leads.delete');
        });

        // Customer Service & Support Ticketing Hub
        Route::prefix('tickets')->group(function () {
            Route::get('/metrics', [TicketController::class, 'metrics'])->middleware('permission:tickets.view');
            Route::get('/', [TicketController::class, 'index'])->middleware('permission:tickets.view');
            Route::post('/', [TicketController::class, 'store'])->middleware('permission:tickets.create');
            Route::get('/{ticket}', [TicketController::class, 'show'])->middleware('permission:tickets.view');
            Route::put('/{ticket}', [TicketController::class, 'update'])->middleware('permission:tickets.edit');
            Route::post('/{ticket}/claim', [TicketController::class, 'claim'])->middleware('permission:tickets.assign');
            Route::patch('/{ticket}/assign', [TicketController::class, 'assign'])->middleware('permission:tickets.assign');
            Route::post('/{ticket}/comments', [TicketController::class, 'addComment'])->middleware('permission:tickets.edit');
            Route::patch('/{ticket}/status', [TicketController::class, 'updateStatus'])->middleware('permission:tickets.edit');
            Route::post('/{ticket}/escalate', [TicketController::class, 'escalate'])->middleware('permission:tickets.escalate');
            Route::delete('/{ticket}', [TicketController::class, 'destroy'])->middleware('permission:tickets.delete');
        });

        // Ticket Categories — Listing & Details (Viewable by authenticated users)
        Route::get('/ticket-categories',                   [TicketCategoryController::class, 'index']);
        Route::get('/ticket-categories/{ticket_category}', [TicketCategoryController::class, 'show']);

        // User Directory & Mutations (Protected by Granular Permissions)
        Route::middleware('permission:users.view')->group(function () {
            Route::get('/users', [UserController::class, 'index']);
            Route::get('/users/{user}', [UserController::class, 'show']);
        });

        Route::prefix('users')->group(function () {
            Route::post('/', [UserController::class, 'store'])->middleware('permission:users.create');
            Route::put('/{user}', [UserController::class, 'update'])->middleware('permission:users.edit');
            Route::patch('/{user}/status', [UserController::class, 'updateStatus'])->middleware('permission:users.deactivate');
            Route::put('/{user}/role', [UserController::class, 'assignRole'])->middleware('permission:users.assign_role');
        });

        // Administration Routes (System Administrator only)
        Route::middleware('role:System Administrator')->group(function () {

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
