<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\AssignRoleRequest;
use App\Http\Requests\User\CreateUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Requests\User\UpdateUserStatusRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserController extends Controller
{
    public function __construct(private readonly UserService $userService) {}

    // -------------------------------------------------------------------------
    // User Management
    // -------------------------------------------------------------------------

    /**
     * List all CRM users with their account status and assigned role.
     *
     * Authorized role: System Administrator
     */
    public function index(): AnonymousResourceCollection
    {
        $users = User::with(['roles.permissions'])->orderBy('first_name')->get();

        return UserResource::collection($users);
    }

    /**
     * Display the specified user profile.
     */
    public function show(User $user): UserResource
    {
        return new UserResource($user->load(['roles.permissions']));
    }


    /**
     * Create a new CRM user and assign a role.
     *
     * Authorized role: System Administrator
     */
    public function store(CreateUserRequest $request): JsonResponse
    {
        $user = $this->userService->createUser($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'User created successfully.',
            'data'    => ['user' => new UserResource($user)],
        ], 201);
    }

    /**
     * Update an existing user's profile information.
     *
     * Authorized role: System Administrator
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $user = $this->userService->updateUser($user, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully.',
            'data'    => ['user' => new UserResource($user)],
        ]);
    }

    /**
     * Update user account status (active or inactive).
     *
     * Authorized role: System Administrator
     */
    public function updateStatus(UpdateUserStatusRequest $request, User $user): JsonResponse
    {
        $status = $request->validated('status');

        if ($user->status === $status) {
            return response()->json([
                'success' => false,
                'message' => "User account is already {$status}.",
            ], 422);
        }

        // Prevent an administrator from deactivating their own account.
        if ($status === 'inactive' && $user->id === $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot deactivate your own account.',
            ], 422);
        }

        $user = $this->userService->setStatus($user, $status);

        return response()->json([
            'success' => true,
            'message' => "User account status updated to {$status} successfully.",
            'data'    => ['user' => new UserResource($user)],
        ]);
    }

    // -------------------------------------------------------------------------
    // Role Management
    // -------------------------------------------------------------------------

    /**
     * Assign or change the role of a user.
     *
     * Authorized role: System Administrator
     */
    public function assignRole(AssignRoleRequest $request, User $user): JsonResponse
    {
        $roleId = $request->validated('role_id');
        $role = \App\Models\Role::find($roleId);

        $currentUser = $request->user();
        $isCurrentAdmin = $currentUser && $currentUser->hasRole('System Administrator');

        if ($role && ($role->name === 'System Administrator' || $role->is_system) && ! $isCurrentAdmin) {
            return response()->json([
                'success' => false,
                'message' => 'Only System Administrators can assign the System Administrator role.',
            ], 403);
        }

        $user = $this->userService->assignRole($user, $roleId);

        return response()->json([
            'success' => true,
            'message' => 'Role assigned successfully.',
            'data'    => ['user' => new UserResource($user)],
        ]);
    }
}
