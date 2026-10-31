<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Role\CreateRoleRequest;
use App\Http\Requests\Role\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class RoleController extends Controller
{
    /**
     * List all roles with assigned permissions and user counts.
     */
    public function index(): AnonymousResourceCollection
    {
        $roles = Role::with(['permissions'])
            ->withCount('users')
            ->orderBy('name')
            ->get();

        return RoleResource::collection($roles);
    }

    /**
     * Show role details.
     */
    public function show(Role $role): RoleResource
    {
        $role->load('permissions');
        return new RoleResource($role);
    }

    /**
     * Store a newly created role.
     */
    public function store(CreateRoleRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $name = $validated['name'] ?? $validated['role_name'];

        $role = Role::create([
            'name' => $name,
            'role_name' => $name,
            'description' => $validated['description'] ?? null,
            'role_tier' => $validated['role_tier'] ?? null,
            'is_active' => true,
            'is_system' => false,
            'guard_name' => config('auth.defaults.guard', 'web'),
        ]);

        if (!empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        $role->load('permissions');

        return (new RoleResource($role))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Update an existing role and sync its permissions.
     */
    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        // Enforce system immutability via RolePolicy
        if (Gate::has('update') && !Gate::allows('update', $role)) {
            return response()->json([
                'success' => false,
                'message' => 'System roles cannot be modified.',
            ], 403);
        }

        if ($role->isSystemRole()) {
            return response()->json([
                'success' => false,
                'message' => 'System roles cannot be modified.',
            ], 403);
        }

        $validated = $request->validated();

        $updateData = [];
        if (isset($validated['name']) || isset($validated['role_name'])) {
            $name = $validated['name'] ?? $validated['role_name'];
            $updateData['name'] = $name;
            $updateData['role_name'] = $name;
        }
        if (array_key_exists('description', $validated)) {
            $updateData['description'] = $validated['description'];
        }
        if (isset($validated['role_tier'])) {
            $updateData['role_tier'] = $validated['role_tier'];
        }

        if (!empty($updateData)) {
            $role->update($updateData);
        }

        if (isset($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        $role->load('permissions');

        return (new RoleResource($role))
            ->response()
            ->setStatusCode(200);
    }

    /**
     * Delete a custom role.
     */
    public function destroy(Role $role): JsonResponse
    {
        // Enforce system immutability via RolePolicy
        if (Gate::has('delete') && !Gate::allows('delete', $role)) {
            return response()->json([
                'success' => false,
                'message' => 'This role is protected or has active staff assigned and cannot be deleted.',
            ], 403);
        }

        if ($role->isSystemRole()) {
            return response()->json([
                'success' => false,
                'message' => 'The System Administrator role is protected and cannot be deleted.',
            ], 403);
        }

        $userCount = $role->users()->count();
        if ($userCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Cannot delete role because it is currently assigned to {$userCount} user(s).",
            ], 403);
        }

        $role->delete();

        return response()->json([
            'success' => true,
            'message' => 'Role deleted successfully.',
        ]);
    }
}
