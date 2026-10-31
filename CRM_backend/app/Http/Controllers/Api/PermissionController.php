<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Permissions\PermissionRegistry;
use Illuminate\Http\JsonResponse;

class PermissionController extends Controller
{
    /**
     * Return all registered system permissions grouped by domain for frontend checkbox matrices.
     */
    public function index(): JsonResponse
    {
        $grouped = PermissionRegistry::grouped();

        $data = [];
        foreach ($grouped as $groupName => $permissions) {
            $data[] = [
                'name' => $groupName,
                'permissions' => $permissions,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}

