<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Opportunity\StoreOpportunityRequest;
use App\Http\Requests\Opportunity\TransferOpportunityOwnershipRequest;
use App\Http\Requests\Opportunity\TransitionStageRequest;
use App\Http\Requests\Opportunity\UpdateOpportunityRequest;
use App\Models\Activity;
use App\Models\ExportRecord;
use App\Models\Opportunity;
use App\Models\OpportunityStageHistory;
use App\Models\OpportunityType;
use App\Models\PipelineStage;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OpportunityController extends Controller
{
    /**
     * List opportunities with filtering, search, and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Opportunity::query()
            ->visibleTo($user)
            ->with([
                'account:id,organization_name,industry,location',
                'owner:id,first_name,last_name,email',
                'stage:id,stage_name,display_order,is_closed_won,is_closed_lost',
                'opportunityType:id,type_name,description',
            ]);

        // Search by account name, notes, or deal type
        if ($search = $request->input('search')) {
            $search = trim($search);
            $query->where(function ($q) use ($search) {
                $q->whereHas('account', function ($sub) use ($search) {
                    $sub->where('organization_name', 'ilike', "%{$search}%");
                })
                ->orWhere('notes', 'ilike', "%{$search}%")
                ->orWhereHas('opportunityType', function ($sub) use ($search) {
                    $sub->where('type_name', 'ilike', "%{$search}%");
                });
            });
        }

        // Filter by stage
        if ($stageId = $request->input('stage_id')) {
            $query->where('stage_id', $stageId);
        }

        // Filter by type
        if ($typeId = $request->input('opportunity_type_id')) {
            $query->where('opportunity_type_id', $typeId);
        }

        // Filter by status (open, closed_won, closed_lost, or all)
        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        // Filter by owner
        if ($ownerId = $request->input('owner_user_id')) {
            $query->where('owner_user_id', $ownerId);
        }

        $perPage = (int) $request->input('per_page', 25);
        $opportunities = $query->orderBy('expected_close_date', 'asc')
            ->orderBy('id', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $opportunities->items(),
            'meta' => [
                'current_page' => $opportunities->currentPage(),
                'last_page' => $opportunities->lastPage(),
                'per_page' => $opportunities->perPage(),
                'total' => $opportunities->total(),
            ],
        ]);
    }

    /**
     * Get structured Kanban board data grouped by pipeline stages.
     */
    public function kanban(Request $request): JsonResponse
    {
        $user = $request->user();

        $stages = PipelineStage::where('is_active', true)
            ->orderBy('display_order', 'asc')
            ->get();

        $baseQuery = Opportunity::query()
            ->visibleTo($user)
            ->with([
                'account:id,organization_name,industry,location',
                'owner:id,first_name,last_name,email',
                'opportunityType:id,type_name',
            ]);

        // Optional filters for Kanban
        if ($search = $request->input('search')) {
            $search = trim($search);
            $baseQuery->where(function ($q) use ($search) {
                $q->whereHas('account', function ($sub) use ($search) {
                    $sub->where('organization_name', 'ilike', "%{$search}%");
                })
                ->orWhere('notes', 'ilike', "%{$search}%");
            });
        }

        if ($typeId = $request->input('opportunity_type_id')) {
            $baseQuery->where('opportunity_type_id', $typeId);
        }

        if ($ownerId = $request->input('owner_user_id')) {
            $baseQuery->where('owner_user_id', $ownerId);
        }

        $allOpportunities = $baseQuery->get();

        $kanbanColumns = $stages->map(function ($stage) use ($allOpportunities) {
            $dealsInStage = $allOpportunities->where('stage_id', $stage->id)->values();
            $totalValue = (float) $dealsInStage->sum('value');
            $weightedValue = (float) $dealsInStage->sum(function ($d) {
                return ($d->value ?? 0) * (($d->probability ?? 0) / 100);
            });

            return [
                'stage_id' => $stage->id,
                'stage_name' => $stage->stage_name,
                'display_order' => $stage->display_order,
                'is_closed_won' => (bool) $stage->is_closed_won,
                'is_closed_lost' => (bool) $stage->is_closed_lost,
                'total_deals' => $dealsInStage->count(),
                'total_value' => $totalValue,
                'weighted_value' => $weightedValue,
                'opportunities' => $dealsInStage,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $kanbanColumns,
        ]);
    }

    /**
     * Get high-level Opportunity & Revenue forecasting metrics.
     */
    public function metrics(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Opportunity::query()->visibleTo($user);

        $totalCount = (clone $query)->count();
        $openCount = (clone $query)->where('status', 'open')->count();
        $closedWonCount = (clone $query)->where('status', 'closed_won')->count();
        $closedLostCount = (clone $query)->where('status', 'closed_lost')->count();

        $totalPipelineValue = (float) (clone $query)->where('status', 'open')->sum('value');
        $closedWonValue = (float) (clone $query)->where('status', 'closed_won')->sum('value');

        // Weighted forecast: sum of (value * probability / 100) for open deals
        $openDeals = (clone $query)->where('status', 'open')->get(['value', 'probability']);
        $weightedForecastValue = (float) $openDeals->reduce(function ($carry, $deal) {
            return $carry + (($deal->value ?? 0) * (($deal->probability ?? 0) / 100));
        }, 0);

        $closedTotal = $closedWonCount + $closedLostCount;
        $winRatePct = $closedTotal > 0 ? round(($closedWonCount / $closedTotal) * 100, 1) : 0;
        $avgDealSize = $openCount > 0 ? round($totalPipelineValue / $openCount, 2) : 0;

        // Stage breakdown
        $stages = PipelineStage::where('is_active', true)->orderBy('display_order')->get();
        $stageBreakdown = $stages->map(function ($s) use ($query) {
            $count = (clone $query)->where('stage_id', $s->id)->count();
            $val = (float) (clone $query)->where('stage_id', $s->id)->sum('value');
            return [
                'stage_id' => $s->id,
                'stage_name' => $s->stage_name,
                'count' => $count,
                'total_value' => $val,
                'is_closed_won' => (bool) $s->is_closed_won,
                'is_closed_lost' => (bool) $s->is_closed_lost,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'total_opportunities' => $totalCount,
                'open_deals_count' => $openCount,
                'closed_won_count' => $closedWonCount,
                'closed_lost_count' => $closedLostCount,
                'total_pipeline_value' => $totalPipelineValue,
                'weighted_forecast_value' => round($weightedForecastValue, 2),
                'closed_won_value' => $closedWonValue,
                'win_rate_pct' => $winRatePct,
                'avg_deal_size' => $avgDealSize,
                'stage_breakdown' => $stageBreakdown,
            ],
        ]);
    }

    /**
     * Show detailed opportunity profile including full stage timeline and exports.
     */
    public function show(Opportunity $opportunity, Request $request): JsonResponse
    {
        $opportunity->load([
            'account.primaryContact',
            'lead',
            'owner:id,first_name,last_name,email',
            'stage',
            'opportunityType',
            'stageHistories.fromStage',
            'stageHistories.toStage',
            'stageHistories.changedBy:id,first_name,last_name',
            'exportRecords.exportedBy:id,first_name,last_name',
        ]);

        return response()->json([
            'success' => true,
            'data' => $opportunity,
        ]);
    }

    /**
     * Create a new commercial opportunity.
     */
    public function store(StoreOpportunityRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        // Default stage to first active stage if not passed
        if (empty($validated['stage_id'])) {
            $firstStage = PipelineStage::where('is_active', true)->orderBy('display_order')->first();
            $validated['stage_id'] = $firstStage?->id;
        }

        // Default owner to creator if not passed
        if (empty($validated['owner_user_id'])) {
            $validated['owner_user_id'] = $user->id;
        }

        $stage = PipelineStage::find($validated['stage_id']);
        if ($stage?->is_closed_won) {
            $validated['status'] = 'closed_won';
            $validated['closed_at'] = now();
            $validated['probability'] = 100.00;
        } elseif ($stage?->is_closed_lost) {
            $validated['status'] = 'closed_lost';
            $validated['closed_at'] = now();
            $validated['probability'] = 0.00;
        } else {
            $validated['status'] = 'open';
        }

        $opportunity = DB::transaction(function () use ($validated, $user, $stage) {
            $opp = Opportunity::create($validated);

            // Log initial stage history
            OpportunityStageHistory::create([
                'opportunity_id' => $opp->id,
                'from_stage_id' => null,
                'to_stage_id' => $opp->stage_id,
                'changed_by_user_id' => $user->id,
                'changed_at' => now(),
                'notes' => 'Opportunity created in stage ' . ($stage?->stage_name ?? 'Initial Stage'),
            ]);

            // Create activity
            Activity::create([
                'account_id' => $opp->account_id,
                'opportunity_id' => $opp->id,
                'assigned_user_id' => $opp->owner_user_id,
                'activity_type' => 'deal_created',
                'subject' => "Opportunity Created: " . $opp->deal_name,
                'description' => "Value: ETB " . number_format($opp->value, 2) . ". Probability: {$opp->probability}%.",
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            AuditLogger::log(
                'Opportunity',
                $opp->id,
                'created',
                null,
                null,
                $opp->toArray(),
                $user->id
            );

            return $opp;
        });

        $opportunity->load(['account', 'owner', 'stage', 'opportunityType']);

        return response()->json([
            'success' => true,
            'message' => 'Commercial Opportunity created successfully',
            'data' => $opportunity,
        ], 201);
    }

    /**
     * Update an opportunity.
     */
    public function update(UpdateOpportunityRequest $request, Opportunity $opportunity): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();
        $oldValues = $opportunity->toArray();

        $opportunity = DB::transaction(function () use ($opportunity, $validated, $user, $oldValues) {
            // Check if stage is changing
            if (!empty($validated['stage_id']) && $validated['stage_id'] != $opportunity->stage_id) {
                $fromStageId = $opportunity->stage_id;
                $newStage = PipelineStage::find($validated['stage_id']);

                if ($newStage?->is_closed_won) {
                    $validated['status'] = 'closed_won';
                    $validated['closed_at'] = now();
                    $validated['probability'] = 100.00;
                } elseif ($newStage?->is_closed_lost) {
                    $validated['status'] = 'closed_lost';
                    $validated['closed_at'] = now();
                    $validated['probability'] = 0.00;
                } else {
                    $validated['status'] = 'open';
                    $validated['closed_at'] = null;
                }

                OpportunityStageHistory::create([
                    'opportunity_id' => $opportunity->id,
                    'from_stage_id' => $fromStageId,
                    'to_stage_id' => $validated['stage_id'],
                    'changed_by_user_id' => $user->id,
                    'changed_at' => now(),
                    'notes' => $validated['notes'] ?? 'Stage updated to ' . ($newStage?->stage_name ?? 'new stage'),
                ]);
            }

            $opportunity->update($validated);

            AuditLogger::log(
                'Opportunity',
                $opportunity->id,
                'updated',
                null,
                $oldValues,
                $opportunity->fresh()->toArray(),
                $user->id
            );

            return $opportunity;
        });

        $opportunity->load(['account', 'owner', 'stage', 'opportunityType']);

        return response()->json([
            'success' => true,
            'message' => 'Commercial Opportunity updated successfully',
            'data' => $opportunity,
        ]);
    }

    /**
     * Transition an opportunity stage (Kanban drag-and-drop or 1-click step).
     */
    public function transitionStage(TransitionStageRequest $request, Opportunity $opportunity): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();
        $toStageId = (int) $validated['stage_id'];

        if ($opportunity->stage_id == $toStageId) {
            return response()->json([
                'success' => true,
                'message' => 'Opportunity is already in this stage',
                'data' => $opportunity->load(['account', 'owner', 'stage', 'opportunityType']),
            ]);
        }

        $fromStageId = $opportunity->stage_id;
        $toStage = PipelineStage::findOrFail($toStageId);

        $updates = ['stage_id' => $toStageId];

        if ($toStage->is_closed_won) {
            $updates['status'] = 'closed_won';
            $updates['closed_at'] = now();
            $updates['probability'] = 100.00;
        } elseif ($toStage->is_closed_lost) {
            $updates['status'] = 'closed_lost';
            $updates['closed_at'] = now();
            $updates['probability'] = 0.00;
        } else {
            $updates['status'] = 'open';
            $updates['closed_at'] = null;
        }

        DB::transaction(function () use ($opportunity, $updates, $fromStageId, $toStage, $validated, $user) {
            $opportunity->update($updates);

            OpportunityStageHistory::create([
                'opportunity_id' => $opportunity->id,
                'from_stage_id' => $fromStageId,
                'to_stage_id' => $toStage->id,
                'changed_by_user_id' => $user->id,
                'changed_at' => now(),
                'notes' => $validated['notes'] ?? "Transitioned to {$toStage->stage_name}",
            ]);

            Activity::create([
                'account_id' => $opportunity->account_id,
                'opportunity_id' => $opportunity->id,
                'assigned_user_id' => $user->id,
                'activity_type' => 'stage_change',
                'subject' => "Deal Stage Changed: {$toStage->stage_name}",
                'description' => $validated['notes'] ?: "Moved to {$toStage->stage_name}",
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            AuditLogger::log(
                'Opportunity',
                $opportunity->id,
                'stage_transition',
                null,
                ['stage_id' => $fromStageId],
                ['stage_id' => $toStage->id, 'notes' => $validated['notes'] ?? null],
                $user->id
            );
        });

        $opportunity->load(['account', 'owner', 'stage', 'opportunityType', 'stageHistories.fromStage', 'stageHistories.toStage', 'stageHistories.changedBy']);

        return response()->json([
            'success' => true,
            'message' => "Opportunity moved to {$toStage->stage_name}",
            'data' => $opportunity,
        ]);
    }

    /**
     * Transfer opportunity ownership (BR-002: only owner, CRM Manager, or Admin).
     */
    public function transferOwnership(TransferOpportunityOwnershipRequest $request, Opportunity $opportunity): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        $roleName = strtolower($user->role?->role_name ?? '');

        $isAuthorized = ($user->id === $opportunity->owner_user_id)
            || str_contains($roleName, 'admin')
            || str_contains($roleName, 'manager')
            || $user->hasRole(['System Administrator', 'CRM Manager']);

        if (!$isAuthorized) {
            return response()->json([
                'success' => false,
                'message' => 'Ownership of an Opportunity may only be transferred by its current Owner, a CRM Manager, or a System Administrator (BR-002).',
            ], 403);
        }

        $newOwner = User::findOrFail($validated['new_owner_user_id']);
        $oldOwnerId = $opportunity->owner_user_id;

        $opportunity->update(['owner_user_id' => $newOwner->id]);

        Activity::create([
            'account_id' => $opportunity->account_id,
            'opportunity_id' => $opportunity->id,
            'assigned_user_id' => $newOwner->id,
            'activity_type' => 'ownership_transfer',
            'subject' => "Opportunity Ownership Transferred to {$newOwner->first_name} {$newOwner->last_name}",
            'description' => $validated['reason'] ?? 'Ownership reassigned.',
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        AuditLogger::log(
            'Opportunity',
            $opportunity->id,
            'ownership_transferred',
            null,
            ['owner_user_id' => $oldOwnerId],
            ['owner_user_id' => $newOwner->id, 'reason' => $validated['reason'] ?? null],
            $user->id
        );

        $opportunity->load(['account', 'owner', 'stage', 'opportunityType']);

        return response()->json([
            'success' => true,
            'message' => "Ownership transferred successfully to {$newOwner->first_name} {$newOwner->last_name}",
            'data' => $opportunity,
        ]);
    }

    /**
     * Export Closed-Won Opportunity data for Property Management System (PMS) Handoff (SRS §10.1).
     */
    public function exportPms(Request $request, Opportunity $opportunity)
    {
        $user = $request->user();
        $opportunity->load(['account.primaryContact', 'opportunityType', 'stage', 'owner']);

        $format = strtolower($request->input('format', 'json'));
        if (!in_array($format, ['json', 'csv', 'excel'])) {
            $format = 'json';
        }

        $primaryContact = $opportunity->account?->primaryContact;

        // Structured contract payload per SRS §10.1 & Database Design v2.0
        $handoffData = [
            'pms_contract_id' => 'ITP-PMS-' . str_pad($opportunity->id, 5, '0', STR_PAD_LEFT),
            'export_timestamp' => now()->toIso8601String(),
            'account' => [
                'id' => $opportunity->account?->id,
                'organization_name' => $opportunity->account?->organization_name,
                'industry' => $opportunity->account?->industry,
                'location' => $opportunity->account?->location,
                'contact_information' => $opportunity->account?->contact_information,
            ],
            'primary_contact' => [
                'name' => $primaryContact ? ($primaryContact->first_name . ' ' . $primaryContact->last_name) : null,
                'role_title' => $primaryContact?->role_title,
                'email' => $primaryContact?->email,
                'phone' => $primaryContact?->phone,
            ],
            'opportunity' => [
                'id' => $opportunity->id,
                'deal_name' => $opportunity->deal_name,
                'type' => $opportunity->opportunityType?->type_name,
                'value' => (float) $opportunity->value,
                'currency' => 'ETB',
                'closing_date' => $opportunity->expected_close_date?->toDateString(),
                'status' => $opportunity->status,
                'notes' => $opportunity->notes,
                'lead_origin_id' => $opportunity->lead_id,
            ],
            'exported_by' => [
                'id' => $user->id,
                'name' => $user->first_name . ' ' . $user->last_name,
                'email' => $user->email,
            ],
        ];

        $fileName = 'PMS_Handoff_Deal_' . $opportunity->id . '_' . now()->format('Ymd_His') . '.' . ($format === 'excel' ? 'csv' : $format);

        // Record export in export_records table
        ExportRecord::create([
            'opportunity_id' => $opportunity->id,
            'exported_by_user_id' => $user->id,
            'export_type' => 'PMS handoff',
            'export_format' => strtoupper($format),
            'file_name' => $fileName,
            'record_count' => 1,
            'status' => 'completed',
            'exported_at' => now(),
        ]);

        if ($format === 'json') {
            return response()->json([
                'success' => true,
                'file_name' => $fileName,
                'data' => $handoffData,
            ]);
        }

        // CSV Format
        $headers = [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
        ];

        $callback = function () use ($handoffData) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'PMS Contract ID',
                'Organization Name',
                'Industry',
                'Location',
                'Primary Contact Name',
                'Primary Contact Role',
                'Contact Email',
                'Contact Phone',
                'Deal Name',
                'Deal Type',
                'Value (ETB)',
                'Close Date',
                'Status',
                'Exported At',
            ]);

            fputcsv($handle, [
                $handoffData['pms_contract_id'],
                $handoffData['account']['organization_name'],
                $handoffData['account']['industry'],
                $handoffData['account']['location'],
                $handoffData['primary_contact']['name'],
                $handoffData['primary_contact']['role_title'],
                $handoffData['primary_contact']['email'],
                $handoffData['primary_contact']['phone'],
                $handoffData['opportunity']['deal_name'],
                $handoffData['opportunity']['type'],
                $handoffData['opportunity']['value'],
                $handoffData['opportunity']['closing_date'],
                $handoffData['opportunity']['status'],
                $handoffData['export_timestamp'],
            ]);

            fclose($handle);
        };

        return new StreamedResponse($callback, 200, $headers);
    }

    /**
     * Soft delete an opportunity.
     */
    public function destroy(Opportunity $opportunity, Request $request): JsonResponse
    {
        $user = $request->user();
        $oldValues = $opportunity->toArray();
        $opportunity->delete();

        AuditLogger::log(
            'Opportunity',
            $opportunity->id,
            'deleted',
            null,
            $oldValues,
            null,
            $user->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Commercial Opportunity deleted successfully',
        ]);
    }

    /**
     * List active opportunity types.
     */
    public function types(): JsonResponse
    {
        $types = OpportunityType::where('is_active', true)->get();
        return response()->json([
            'success' => true,
            'data' => $types,
        ]);
    }
}
