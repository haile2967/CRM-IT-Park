<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PipelineStage\CreatePipelineStageRequest;
use App\Http\Requests\PipelineStage\ReorderPipelineStagesRequest;
use App\Http\Requests\PipelineStage\TogglePipelineStageStatusRequest;
use App\Http\Requests\PipelineStage\UpdatePipelineStageRequest;
use App\Http\Resources\PipelineStageResource;
use App\Models\PipelineStage;
use App\Services\PipelineStageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PipelineStageController extends Controller
{
    public function __construct(private readonly PipelineStageService $service) {}

    // -------------------------------------------------------------------------
    // Pipeline Stages Management & Listing
    // -------------------------------------------------------------------------

    /**
     * List pipeline stages ordered by display_order.
     *
     * System Administrator: returns all stages with opportunities_count
     * (or active only when ?active_only=true or ?status=active is passed).
     * Other roles: returns only active stages for opportunity dropdowns.
     *
     * Authorized: all authenticated users (auth:sanctum)
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $isAdmin = $user && $user->hasRole('System Administrator');

        if (! $isAdmin || $request->boolean('active_only') || $request->query('status') === 'active') {
            $stages = PipelineStage::active()->ordered()->get();
        } else {
            $stages = PipelineStage::withCount('opportunities')
                ->ordered()
                ->get();
        }

        return PipelineStageResource::collection($stages);
    }

    /**
     * Create a new pipeline stage.
     *
     * Authorized role: System Administrator
     */
    public function store(CreatePipelineStageRequest $request): JsonResponse
    {
        $stage = $this->service->createStage($request->validated());

        return response()->json([
            'success' => true,
            'message' => "Pipeline stage \"{$stage->stage_name}\" created successfully.",
            'data'    => ['stage' => new PipelineStageResource($stage)],
        ], 201);
    }

    /**
     * Update an existing pipeline stage's name, order, or terminal flags.
     *
     * Authorized role: System Administrator
     */
    public function update(UpdatePipelineStageRequest $request, PipelineStage $stage): JsonResponse
    {
        $stage = $this->service->updateStage($stage, $request->validated());

        return response()->json([
            'success' => true,
            'message' => "Pipeline stage \"{$stage->stage_name}\" updated successfully.",
            'data'    => ['stage' => new PipelineStageResource($stage)],
        ]);
    }

    /**
     * Activate or deactivate a pipeline stage.
     *
     * Deactivating preserves all historical opportunity data — the stage is
     * simply hidden from active selection lists going forward.
     *
     * Authorized role: System Administrator
     */
    public function toggleStatus(TogglePipelineStageStatusRequest $request, PipelineStage $stage): JsonResponse
    {
        $isActive = $request->boolean('is_active');

        if ($stage->is_active === $isActive) {
            $state = $isActive ? 'active' : 'inactive';
            return response()->json([
                'success' => false,
                'message' => "Pipeline stage \"{$stage->stage_name}\" is already {$state}.",
            ], 422);
        }

        $stage = $this->service->toggleStatus($stage, $isActive);
        $state = $isActive ? 'activated' : 'deactivated';

        return response()->json([
            'success' => true,
            'message' => "Pipeline stage \"{$stage->stage_name}\" {$state} successfully.",
            'data'    => ['stage' => new PipelineStageResource($stage)],
        ]);
    }

    /**
     * Bulk-update the display_order of multiple stages in one request.
     *
     * Payload: { "stages": [ { "id": 1, "display_order": 2 }, ... ] }
     *
     * Authorized role: System Administrator
     */
    public function reorder(ReorderPipelineStagesRequest $request): JsonResponse
    {
        $this->service->reorderStages($request->validated('stages'));

        $stages = PipelineStage::withCount('opportunities')->ordered()->get();

        return response()->json([
            'success' => true,
            'message' => 'Pipeline stage order updated successfully.',
            'data'    => ['stages' => PipelineStageResource::collection($stages)],
        ]);
    }

    /**
     * Permanently delete a pipeline stage.
     *
     * This action is blocked when the stage has linked opportunities —
     * use the toggle-status endpoint to deactivate it instead.
     *
     * Authorized role: System Administrator
     */
    public function destroy(PipelineStage $stage): JsonResponse
    {
        try {
            $stageName = $stage->stage_name;
            $this->service->deleteStage($stage);

            return response()->json([
                'success' => true,
                'message' => "Pipeline stage \"{$stageName}\" deleted successfully.",
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    // -------------------------------------------------------------------------
    // Public / Authenticated: active stages for opportunity forms (all roles)
    // -------------------------------------------------------------------------

    /**
     * Return only active, ordered stages for use in opportunity dropdowns.
     * This endpoint is accessible to all authenticated CRM users (not just Admins).
     *
     * Authorized: any authenticated user (auth:sanctum)
     */
    public function activeStages(): AnonymousResourceCollection
    {
        $stages = PipelineStage::active()->ordered()->get();

        return PipelineStageResource::collection($stages);
    }
}
