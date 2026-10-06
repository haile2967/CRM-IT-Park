<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
    /**
     * Display a listing of system roles.
     */
    public function index(): JsonResponse
    {
        $roles = Role::where('is_active', true)
            ->orderBy('role_tier')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $roles,
        ]);
    }
}
