<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeadSource;
use App\Models\ReferenceCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReferenceDataController extends Controller
{
    /**
     * Active Lead Sources for form dropdowns.
     */
    public function leadSources(): JsonResponse
    {
        $sources = LeadSource::where('is_active', true)
            ->orderBy('source_name')
            ->get(['id', 'source_name', 'description']);

        return response()->json([
            'success' => true,
            'data' => $sources,
        ]);
    }

    /**
     * Active Lead Sectors / Reference Categories for form dropdowns.
     */
    public function leadCategories(Request $request): JsonResponse
    {
        $group = $request->query('group', 'lead_sector');

        $categories = ReferenceCategory::where('is_active', true)
            ->when($group, fn($q) => $q->where('category_group', $group))
            ->orderBy('display_order')
            ->get(['id', 'category_group', 'category_name', 'description']);

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Active Account Types (Startup Incubatee, Commercial Park Tenant, Strategic Partner, etc.)
     */
    public function accountTypes(): JsonResponse
    {
        $types = ReferenceCategory::where('is_active', true)
            ->where('category_group', 'account_type')
            ->orderBy('display_order')
            ->get(['id', 'category_group', 'category_name', 'description']);

        return response()->json([
            'success' => true,
            'data' => $types,
        ]);
    }
}
