<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class UserController extends Controller
{
    /**
     * Display a listing of system users with filtering and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with('role')->orderBy('first_name')->orderBy('last_name');

        if ($request->filled('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = '%' . trim($request->search) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'ilike', $search)
                  ->orWhere('last_name', 'ilike', $search)
                  ->orWhere('email', 'ilike', $search);
            });
        }

        $users = $query->paginate($request->integer('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    /**
     * Store a newly created system user (Admin only).
     */
    public function store(CreateUserRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['password'] = Hash::make($validated['password']);
        $validated['status'] = $validated['status'] ?? 'active';

        $user = User::create($validated);
        $user->load('role');

        AuditLogger::log('users', $user->user_id, 'create', null, null, json_encode([
            'email' => $user->email,
            'role_id' => $user->role_id,
            'status' => $user->status,
        ]));

        return response()->json([
            'success' => true,
            'message' => 'User created successfully.',
            'data' => $user,
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified user details along with portfolio statistics.
     */
    public function show(int $id): JsonResponse
    {
        $user = User::with('role')->findOrFail($id);

        $statistics = [
            'leads_count' => $user->ownedLeads()->count(),
            'accounts_count' => $user->ownedAccounts()->count(),
            'opportunities_count' => $user->ownedOpportunities()->count(),
            'assigned_tickets_count' => $user->assignedTickets()->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $user,
            'statistics' => $statistics,
        ]);
    }

    /**
     * Update the specified user (Admin only).
     */
    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $validated = $request->validated();

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $oldValues = $user->only(['first_name', 'last_name', 'email', 'role_id', 'status', 'phone']);
        $user->update($validated);
        $user->load('role');

        AuditLogger::log('users', $user->user_id, 'update', null, json_encode($oldValues), json_encode($validated));

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully.',
            'data' => $user,
        ]);
    }

    /**
     * Activate or Deactivate user (Admin only, SEC-005 & FR-RBAC-004).
     */
    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        $targetUser = User::findOrFail($id);
        $currentUser = $request->user();

        // Guard: Cannot deactivate self
        if ($targetUser->user_id === $currentUser->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot deactivate your own account.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Guard: Cannot deactivate last remaining active System Administrator
        if ($targetUser->isAdmin() && $targetUser->status === 'active') {
            $adminCount = User::whereHas('role', function ($q) {
                $q->where('role_name', 'System Administrator');
            })->where('status', 'active')->count();

            if ($adminCount <= 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot deactivate the last active System Administrator.',
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $newStatus = ($targetUser->status === 'active') ? 'inactive' : 'active';
        $deactivatedAt = ($newStatus === 'inactive') ? now() : null;

        $targetUser->update([
            'status' => $newStatus,
            'deactivated_at' => $deactivatedAt,
        ]);

        // SEC-005: If deactivated, revoke all active tokens immediately
        if ($newStatus === 'inactive') {
            $targetUser->tokens()->delete();
        }

        AuditLogger::log('users', $targetUser->user_id, 'status_change', 'status', $targetUser->status, $newStatus);

        return response()->json([
            'success' => true,
            'message' => "User successfully {$newStatus}d.",
            'data' => [
                'user_id' => $targetUser->user_id,
                'status' => $targetUser->status,
                'deactivated_at' => $targetUser->deactivated_at,
            ],
        ]);
    }
}
