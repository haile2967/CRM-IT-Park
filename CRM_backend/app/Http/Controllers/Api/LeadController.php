<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lead\AssignLeadRequest;
use App\Http\Requests\Lead\ConvertLeadRequest;
use App\Http\Requests\Lead\StoreLeadRequest;
use App\Http\Requests\Lead\UpdateLeadRequest;
use App\Models\Lead;
use App\Services\LeadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    public function __construct(
        protected LeadService $leadService
    ) {}

    /**
     * List leads with filtering, search, pagination, and Kanban grouping.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // 1. Kanban Pipeline Board View
        if ($request->query('view') === 'kanban') {
            $baseQuery = Lead::query()
                ->with(['owner:id,first_name,last_name,email', 'source', 'category'])
                ->visibleTo($user)
                ->search($request->query('search'))
                ->byOwner($request->query('owner_id'))
                ->byPriority($request->query('priority'));

            $columns = [
                Lead::STATUS_NEW => [],
                Lead::STATUS_CONTACTED => [],
                Lead::STATUS_QUALIFIED => [],
                Lead::STATUS_CONVERTED => [],
                Lead::STATUS_UNQUALIFIED => [],
            ];

            $leads = $baseQuery->orderBy('lead_score', 'desc')->get();
            foreach ($leads as $lead) {
                if (isset($columns[$lead->status])) {
                    $columns[$lead->status][] = $lead;
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'view' => 'kanban',
                    'columns' => $columns,
                    'total_count' => $leads->count(),
                ],
            ]);
        }

        // 2. Dense Paginated Table View
        $perPage = min(100, max(5, (int)$request->query('per_page', 15)));
        $sortBy = in_array($request->query('sort_by'), ['name', 'organization', 'status', 'lead_score', 'priority', 'created_at', 'next_follow_up_at'])
            ? $request->query('sort_by')
            : 'created_at';
        $sortOrder = strtolower((string)$request->query('sort_order')) === 'asc' ? 'asc' : 'desc';

        $paginator = Lead::query()
            ->with(['owner:id,first_name,last_name,email', 'source', 'category'])
            ->visibleTo($user)
            ->search($request->query('search'))
            ->byStatus($request->query('status'))
            ->byOwner($request->query('owner_id'))
            ->byPriority($request->query('priority'))
            ->orderBy($sortBy, $sortOrder)
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $paginator->items(),
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'has_more' => $paginator->hasMorePages(),
            ],
        ]);
    }

    /**
     * Retrieve high-level lead pipeline metrics and SLA health.
     */
    public function metrics(Request $request): JsonResponse
    {
        $metrics = $this->leadService->getMetrics($request->user());

        return response()->json([
            'success' => true,
            'data' => $metrics,
        ]);
    }

    /**
     * Real-time duplicate check endpoint for email, phone, and company.
     */
    public function checkDuplicate(Request $request): JsonResponse
    {
        $result = $this->leadService->findDuplicates(
            $request->query('email'),
            $request->query('phone'),
            $request->query('organization'),
            $request->query('exclude_id') ? (int)$request->query('exclude_id') : null
        );

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    /**
     * Create a new Lead with optional duplicate enforcement.
     */
    public function store(StoreLeadRequest $request): JsonResponse
    {
        $result = $this->leadService->createLead(
            $request->validated(),
            $request->user(),
            $request->boolean('force_duplicate')
        );

        if (!empty($result['duplicate_warning'])) {
            return response()->json([
                'success' => false,
                'duplicate_warning' => true,
                'message' => $result['message'],
                'duplicates' => $result['duplicates'],
            ], 409);
        }

        return response()->json([
            'success' => true,
            'message' => 'Lead successfully created',
            'data' => $result['lead'],
        ], 201);
    }

    /**
     * View full lead details with associated activities and conversion history.
     */
    public function show(Lead $lead, Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole(['System Administrator', 'CRM Manager']) && $lead->owner_user_id !== null && $lead->owner_user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized access to lead.'], 403);
        }

        $lead->load([
            'owner:id,first_name,last_name,email,phone',
            'source',
            'category',
            'activities.user:id,first_name,last_name',
            'communications.user:id,first_name,last_name',
            'convertedAccount',
            'convertedContact',
            'convertedOpportunity',
        ]);

        return response()->json([
            'success' => true,
            'data' => $lead,
        ]);
    }

    /**
     * Update lead fields with duplicate checking.
     */
    public function update(UpdateLeadRequest $request, Lead $lead): JsonResponse
    {
        $result = $this->leadService->updateLead(
            $lead,
            $request->validated(),
            $request->user(),
            $request->boolean('force_duplicate')
        );

        if (!empty($result['duplicate_warning'])) {
            return response()->json([
                'success' => false,
                'duplicate_warning' => true,
                'message' => $result['message'],
                'duplicates' => $result['duplicates'],
            ], 409);
        }

        return response()->json([
            'success' => true,
            'message' => 'Lead successfully updated',
            'data' => $result['lead'],
        ]);
    }

    /**
     * Transition lead status (e.g. from new to contacted, qualified, or unqualified).
     */
    public function updateStatus(Request $request, Lead $lead): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:' . implode(',', Lead::VALID_STATUSES),
            'reason' => 'nullable|string|max:500',
        ]);

        $updated = $this->leadService->updateStatus(
            $lead,
            $request->string('status')->value(),
            $request->input('reason'),
            $request->user()
        );

        return response()->json([
            'success' => true,
            'message' => 'Lead status successfully updated',
            'data' => $updated,
        ]);
    }

    /**
     * Assign or reassign lead to a team member (or claim lead).
     */
    public function assign(AssignLeadRequest $request, Lead $lead): JsonResponse
    {
        $updated = $this->leadService->assignLead(
            $lead,
            $request->owner_user_id,
            $request->input('note'),
            $request->user()
        );

        return response()->json([
            'success' => true,
            'message' => 'Lead assignment updated',
            'data' => $updated,
        ]);
    }

    /**
     * Atomic 1-Click Lead Conversion to Corporate Account, Contact, and Deal.
     */
    public function convert(ConvertLeadRequest $request, Lead $lead): JsonResponse
    {
        if ($lead->status === Lead::STATUS_CONVERTED) {
            return response()->json([
                'success' => false,
                'message' => 'Lead has already been converted.',
            ], 422);
        }

        $result = $this->leadService->convertLead(
            $lead,
            $request->validated(),
            $request->user()
        );

        return response()->json([
            'success' => true,
            'message' => 'Lead successfully converted into Corporate Account, Contact, and Deal.',
            'data' => $result,
        ]);
    }

    /**
     * Soft delete lead.
     */
    public function destroy(Lead $lead, Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole(['System Administrator', 'CRM Manager']) && $lead->owner_user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized to delete this lead.'], 403);
        }

        $lead->delete();

        return response()->json([
            'success' => true,
            'message' => 'Lead deleted successfully',
        ]);
    }
}
