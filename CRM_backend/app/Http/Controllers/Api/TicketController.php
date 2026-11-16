<?php

namespace App\Http\Controllers\Api;

use App\Enums\TicketPriority;
use App\Http\Controllers\Controller;
use App\Http\Requests\Ticket\AssignTicketRequest;
use App\Http\Requests\Ticket\StoreTicketCommentRequest;
use App\Http\Requests\Ticket\StoreTicketRequest;
use App\Http\Requests\Ticket\UpdateTicketRequest;
use App\Models\EscalationPolicy;
use App\Models\Ticket;
use App\Models\TicketComment;
use App\Models\TicketEscalationHistory;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TicketController extends Controller
{
    /**
     * List tickets with queue filtering, multi-attribute search, and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $baseQuery = Ticket::query()->visibleTo($user);

        // Calculate queue tab counts for quick triage badges
        $counts = [
            'all' => (clone $baseQuery)->count(),
            'my_assigned' => (clone $baseQuery)->where('assignee_user_id', $user->id)->count(),
            'unassigned' => (clone $baseQuery)->unassigned()->count(),
            'escalated' => (clone $baseQuery)->escalated()->count(),
        ];

        $query = (clone $baseQuery)->with([
            'account:id,organization_name,industry,location',
            'contact:id,account_id,first_name,last_name,email,phone,role_title',
            'category:id,category_name',
            'assignee:id,first_name,last_name,email',
        ]);

        // Filter by Queue tab
        $queue = $request->input('queue', 'all');
        match ($queue) {
            'my_assigned' => $query->where('assignee_user_id', $user->id),
            'unassigned' => $query->unassigned(),
            'escalated' => $query->escalated(),
            default => null,
        };

        // Filter by Status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Filter by Priority
        if ($priority = $request->input('priority')) {
            $query->where('priority', $priority);
        }

        // Filter by Category
        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        // Multi-attribute search (ticket # / subject / description / organization name / contact)
        if ($search = $request->input('search')) {
            $search = trim($search);

            // Check if search is a ticket number like "TICK-00005" or "5"
            $ticketId = null;
            if (preg_match('/^TICK-(\d+)$/i', $search, $matches)) {
                $ticketId = (int) $matches[1];
            } elseif (ctype_digit($search)) {
                $ticketId = (int) $search;
            }

            $query->where(function ($q) use ($search, $ticketId) {
                if ($ticketId) {
                    $q->where('id', $ticketId);
                }
                $q->orWhere('subject', 'ilike', "%{$search}%")
                  ->orWhere('description', 'ilike', "%{$search}%")
                  ->orWhereHas('account', function ($sub) use ($search) {
                      $sub->where('organization_name', 'ilike', "%{$search}%");
                  })
                  ->orWhereHas('contact', function ($sub) use ($search) {
                      $sub->where('first_name', 'ilike', "%{$search}%")
                          ->orWhere('last_name', 'ilike', "%{$search}%")
                          ->orWhere('email', 'ilike', "%{$search}%");
                  });
            });
        }

        // Sorting: default by escalated desc, last_activity_at desc
        $sortBy = $request->input('sort_by', 'last_activity_at');
        $sortDirection = strtolower($request->input('sort_direction', 'desc')) === 'asc' ? 'asc' : 'desc';

        if ($sortBy === 'priority') {
            $query->orderByRaw("
                CASE priority
                    WHEN 'Urgent' THEN 1
                    WHEN 'High' THEN 2
                    WHEN 'Medium' THEN 3
                    WHEN 'Low' THEN 4
                    ELSE 5
                END {$sortDirection}
            ");
        } elseif (in_array($sortBy, ['id', 'subject', 'status', 'created_at', 'last_activity_at'])) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('escalated', 'desc')->orderBy('last_activity_at', 'desc');
        }

        $perPage = min((int) $request->input('per_page', 15), 100);
        $tickets = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $tickets->items(),
            'counts' => $counts,
            'meta' => [
                'current_page' => $tickets->currentPage(),
                'last_page' => $tickets->lastPage(),
                'per_page' => $tickets->perPage(),
                'total' => $tickets->total(),
            ],
        ]);
    }

    /**
     * Operational KPI Metrics for Support Ticketing Hub cards.
     */
    public function metrics(Request $request): JsonResponse
    {
        $user = $request->user();
        $baseQuery = Ticket::query()->visibleTo($user);

        $totalActive = (clone $baseQuery)->active()->count();
        $unassignedCount = (clone $baseQuery)->active()->unassigned()->count();
        $escalatedCount = (clone $baseQuery)->active()->escalated()->count();

        // Calculate average resolution time in hours for resolved/closed tickets
        $resolvedTickets = (clone $baseQuery)->resolved()
            ->whereNotNull('closed_at')
            ->select(DB::raw('AVG(EXTRACT(EPOCH FROM (closed_at - created_at))) / 3600 as avg_hours'))
            ->value('avg_hours');

        $avgResolutionHours = round((float) ($resolvedTickets ?? 0), 1);

        // Priority breakdown for active tickets
        $priorityCounts = (clone $baseQuery)->active()
            ->select('priority', DB::raw('count(*) as count'))
            ->groupBy('priority')
            ->pluck('count', 'priority')
            ->toArray();

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_active' => $totalActive,
                'unassigned_count' => $unassignedCount,
                'escalated_count' => $escalatedCount,
                'avg_resolution_hours' => $avgResolutionHours,
                'urgent_high_count' => ($priorityCounts['Urgent'] ?? 0) + ($priorityCounts['High'] ?? 0),
                'priority_breakdown' => $priorityCounts,
            ],
        ]);
    }

    /**
     * Show detailed ticket with full relations and dual-stream comment trail.
     */
    public function show(Request $request, int|string $id): JsonResponse
    {
        $user = $request->user();

        $ticket = Ticket::query()
            ->visibleTo($user)
            ->with([
                'account:id,organization_name,industry,location',
                'account.primaryContact:id,account_id,first_name,last_name,email,phone',
                'contact:id,account_id,first_name,last_name,email,phone,role_title',
                'category:id,category_name',
                'assignee:id,first_name,last_name,email',
                'comments' => fn($q) => $q->with('user:id,first_name,last_name,email')->orderBy('created_at', 'asc'),
                'escalationHistories' => fn($q) => $q->with('policy')->orderBy('escalated_at', 'desc'),
            ])
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $ticket,
        ]);
    }

    /**
     * Create a new support ticket.
     */
    public function store(StoreTicketRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $ticket = Ticket::create([
            'account_id' => $validated['account_id'],
            'contact_id' => $validated['contact_id'] ?? null,
            'category_id' => $validated['category_id'],
            'priority' => $validated['priority'],
            'status' => $validated['status'] ?? 'open',
            'subject' => $validated['subject'],
            'description' => $validated['description'] ?? null,
            'assignee_user_id' => $validated['assignee_user_id'] ?? null,
            'last_activity_at' => now(),
            'inactivity_duration_seconds' => 0,
            'escalated' => false,
        ]);

        // If description was provided, also log an opening internal note or public record
        if (!empty($validated['description'])) {
            TicketComment::create([
                'ticket_id' => $ticket->id,
                'user_id' => $request->user()->id,
                'comment_text' => "Ticket created: {$ticket->subject}",
                'is_internal' => true,
            ]);
        }

        $ticket->load([
            'account:id,organization_name,industry,location',
            'contact:id,account_id,first_name,last_name,email,phone,role_title',
            'category:id,category_name',
            'assignee:id,first_name,last_name,email',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Support ticket created successfully.',
            'data' => $ticket,
        ], 201);
    }

    /**
     * Update ticket attributes and refresh activity timer.
     */
    public function update(UpdateTicketRequest $request, int|string $id): JsonResponse
    {
        $user = $request->user();
        $ticket = Ticket::query()->visibleTo($user)->findOrFail($id);

        $validated = $request->validated();

        // Handle status transitions
        if (isset($validated['status']) && $validated['status'] !== $ticket->status) {
            if (in_array($validated['status'], ['resolved', 'closed'])) {
                $validated['closed_at'] = now();
            } else {
                $validated['closed_at'] = null;
            }
        }

        // Updating or acting on an escalated ticket automatically resolves the live escalation flag (BR-005)
        if ($ticket->escalated) {
            $validated['escalated'] = false;
            TicketEscalationHistory::where('ticket_id', $ticket->id)
                ->whereNull('cleared_at')
                ->update(['cleared_at' => now()]);
        }

        // Reset inactivity timer per business rule (BR-004)
        $validated['last_activity_at'] = now();
        $validated['inactivity_duration_seconds'] = 0;

        $ticket->update($validated);

        $ticket->load([
            'account:id,organization_name,industry,location',
            'contact:id,account_id,first_name,last_name,email,phone,role_title',
            'category:id,category_name',
            'assignee:id,first_name,last_name,email',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Ticket updated successfully.',
            'data' => $ticket,
        ]);
    }

    /**
     * 1-Click claim ticket by authenticated support engineer / agent.
     */
    public function claim(Request $request, int|string $id): JsonResponse
    {
        $user = $request->user();
        $ticket = Ticket::query()->visibleTo($user)->findOrFail($id);

        $prevStatus = $ticket->status;
        $newStatus = $prevStatus === 'open' ? 'in_progress' : $prevStatus;

        $ticket->update([
            'assignee_user_id' => $user->id,
            'status' => $newStatus,
            'last_activity_at' => now(),
            'inactivity_duration_seconds' => 0,
            'escalated' => false,
        ]);

        // Clear active escalation history if present
        TicketEscalationHistory::where('ticket_id', $ticket->id)
            ->whereNull('cleared_at')
            ->update(['cleared_at' => now()]);

        TicketComment::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'comment_text' => "Ticket claimed by {$user->first_name} {$user->last_name}.",
            'is_internal' => true,
        ]);

        $ticket->load([
            'account:id,organization_name,industry,location',
            'contact:id,account_id,first_name,last_name,email,phone,role_title',
            'category:id,category_name',
            'assignee:id,first_name,last_name,email',
            'comments' => fn($q) => $q->with('user:id,first_name,last_name,email')->orderBy('created_at', 'asc'),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Ticket successfully assigned to your queue.',
            'data' => $ticket,
        ]);
    }

    /**
     * Reassign ticket to another team member.
     */
    public function assign(AssignTicketRequest $request, int|string $id): JsonResponse
    {
        $user = $request->user();
        $ticket = Ticket::query()->visibleTo($user)->findOrFail($id);

        $newAssignee = User::findOrFail($request->validated()['assignee_user_id']);

        $ticket->update([
            'assignee_user_id' => $newAssignee->id,
            'last_activity_at' => now(),
            'inactivity_duration_seconds' => 0,
            'escalated' => false,
        ]);

        TicketEscalationHistory::where('ticket_id', $ticket->id)
            ->whereNull('cleared_at')
            ->update(['cleared_at' => now()]);

        TicketComment::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'comment_text' => "Ticket reassigned to {$newAssignee->first_name} {$newAssignee->last_name}.",
            'is_internal' => true,
        ]);

        $ticket->load([
            'account:id,organization_name,industry,location',
            'contact:id,account_id,first_name,last_name,email,phone,role_title',
            'category:id,category_name',
            'assignee:id,first_name,last_name,email',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Ticket reassigned to {$newAssignee->first_name} {$newAssignee->last_name}.",
            'data' => $ticket,
        ]);
    }

    /**
     * Add public customer reply or private internal staff note.
     */
    public function addComment(StoreTicketCommentRequest $request, int|string $id): JsonResponse
    {
        $user = $request->user();
        $ticket = Ticket::query()->visibleTo($user)->findOrFail($id);

        $validated = $request->validated();
        $isInternal = (bool) ($validated['is_internal'] ?? false);

        $comment = TicketComment::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'comment_text' => $validated['comment_text'],
            'is_internal' => $isInternal,
        ]);

        // Business Rule BR-004 & BR-005: Reset inactivity timer and clear live escalation
        $ticketUpdates = [
            'last_activity_at' => now(),
            'inactivity_duration_seconds' => 0,
        ];

        if ($ticket->escalated) {
            $ticketUpdates['escalated'] = false;
            TicketEscalationHistory::where('ticket_id', $ticket->id)
                ->whereNull('cleared_at')
                ->update(['cleared_at' => now()]);
        }

        // If ticket was open and an agent replies or writes a note, auto-advance to in_progress
        if ($ticket->status === 'open') {
            $ticketUpdates['status'] = 'in_progress';
        }

        $ticket->update($ticketUpdates);
        $comment->load('user:id,first_name,last_name,email');

        return response()->json([
            'status' => 'success',
            'message' => $isInternal ? 'Internal staff note added.' : 'Public customer response posted.',
            'data' => [
                'comment' => $comment,
                'ticket' => $ticket->fresh([
                    'account:id,organization_name,industry,location',
                    'contact:id,account_id,first_name,last_name,email,phone,role_title',
                    'category:id,category_name',
                    'assignee:id,first_name,last_name,email',
                ]),
            ],
        ], 201);
    }

    /**
     * Update ticket lifecycle status (open -> in_progress -> resolved -> closed).
     */
    public function updateStatus(Request $request, int|string $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:open,in_progress,resolved,closed',
        ]);

        $user = $request->user();
        $ticket = Ticket::query()->visibleTo($user)->findOrFail($id);

        $oldStatus = $ticket->status;
        $newStatus = $request->input('status');

        $updates = [
            'status' => $newStatus,
            'last_activity_at' => now(),
            'inactivity_duration_seconds' => 0,
        ];

        if (in_array($newStatus, ['resolved', 'closed'])) {
            $updates['closed_at'] = now();
            $updates['escalated'] = false;
        } else {
            $updates['closed_at'] = null;
        }

        $ticket->update($updates);

        TicketComment::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'comment_text' => "Ticket status changed from '{$oldStatus}' to '{$newStatus}'.",
            'is_internal' => true,
        ]);

        $ticket->load([
            'account:id,organization_name,industry,location',
            'contact:id,account_id,first_name,last_name,email,phone,role_title',
            'category:id,category_name',
            'assignee:id,first_name,last_name,email',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Ticket status transitioned to '{$newStatus}'.",
            'data' => $ticket,
        ]);
    }

    /**
     * Manually escalate ticket to managerial attention.
     */
    public function escalate(Request $request, int|string $id): JsonResponse
    {
        $user = $request->user();
        $ticket = Ticket::query()->visibleTo($user)->findOrFail($id);

        $policy = EscalationPolicy::where('priority', $ticket->priority->value ?? $ticket->priority)
            ->where('is_active', true)
            ->first();

        $ticket->update([
            'escalated' => true,
            'escalated_at' => now(),
        ]);

        TicketEscalationHistory::create([
            'ticket_id' => $ticket->id,
            'escalation_policy_id' => $policy?->id,
            'escalated_at' => now(),
            'inactivity_duration_minutes' => $ticket->elapsed_inactivity_minutes,
            'notification_sent' => true,
        ]);

        TicketComment::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'comment_text' => "Ticket escalated for urgent managerial review: " . ($request->input('reason') ?: 'Inactivity threshold exceeded'),
            'is_internal' => true,
        ]);

        $ticket->load([
            'account:id,organization_name,industry,location',
            'contact:id,account_id,first_name,last_name,email,phone,role_title',
            'category:id,category_name',
            'assignee:id,first_name,last_name,email',
            'escalationHistories.policy',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Ticket successfully escalated.',
            'data' => $ticket,
        ]);
    }

    /**
     * Delete a ticket.
     */
    public function destroy(Request $request, int|string $id): JsonResponse
    {
        $user = $request->user();
        $ticket = Ticket::query()->visibleTo($user)->findOrFail($id);

        $ticket->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Ticket deleted successfully.',
        ]);
    }
}
