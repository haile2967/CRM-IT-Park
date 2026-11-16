<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Contact\StoreContactRequest;
use App\Http\Requests\Contact\UpdateContactRequest;
use App\Models\Contact;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ContactController extends Controller
{
    /**
     * List contacts with search, account filtering, and role scoping.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Contact::query()
            ->with([
                'account:id,organization_name,industry,location',
                'owner:id,first_name,last_name,email',
            ]);

        // Scoping for BDOs: can view contacts belonging to their accounts or created by them
        if (!$user->hasRole(['System Administrator', 'CRM Manager'])) {
            $query->where(function ($q) use ($user) {
                $q->where('owner_user_id', $user->id)
                  ->orWhereHas('account', fn($aq) => $aq->where('owner_user_id', $user->id));
            });
        }

        // Filter by parent Account
        if ($accountId = $request->input('account_id')) {
            $query->where('account_id', $accountId);
        }

        // Filter by primary status
        if ($request->has('is_primary')) {
            $query->where('is_primary', filter_var($request->input('is_primary'), FILTER_VALIDATE_BOOLEAN));
        }

        // Search by name, role title, email, phone, or organization name
        if ($search = $request->input('search')) {
            $search = trim($search);
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'ilike', "%{$search}%")
                  ->orWhere('last_name', 'ilike', "%{$search}%")
                  ->orWhere('role_title', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%")
                  ->orWhere('phone', 'ilike', "%{$search}%")
                  ->orWhereHas('account', fn($aq) => $aq->where('organization_name', 'ilike', "%{$search}%"));
            });
        }

        // Ordering: primary contacts first, then alphabetical by first name
        $query->orderBy('is_primary', 'desc')->orderBy('first_name', 'asc');

        $perPage = min(max((int) $request->input('per_page', 20), 1), 100);
        $contacts = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $contacts->items(),
            'meta' => [
                'current_page' => $contacts->currentPage(),
                'last_page' => $contacts->lastPage(),
                'per_page' => $contacts->perPage(),
                'total' => $contacts->total(),
            ],
        ]);
    }

    /**
     * Show single contact details.
     */
    public function show(Contact $contact): JsonResponse
    {
        $contact->load([
            'account:id,organization_name,industry,location',
            'owner:id,first_name,last_name,email',
        ]);

        return response()->json([
            'success' => true,
            'data' => $contact,
        ]);
    }

    /**
     * Store a new contact person.
     */
    public function store(StoreContactRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        if (empty($data['owner_user_id'])) {
            $data['owner_user_id'] = $user->id;
        }

        $contact = DB::transaction(function () use ($data, $user) {
            // If marked as primary, reset existing primary contacts for this account
            if (!empty($data['is_primary'])) {
                Contact::where('account_id', $data['account_id'])->update(['is_primary' => false]);
            }

            $created = Contact::create($data);

            AuditLogger::log(
                'Contact',
                $created->id,
                'created',
                null,
                null,
                $created->toArray(),
                $user?->id
            );

            return $created;
        });

        $contact->load(['account:id,organization_name,industry,location', 'owner:id,first_name,last_name,email']);

        return response()->json([
            'success' => true,
            'message' => 'Contact person created successfully',
            'data' => $contact,
        ], 201);
    }

    /**
     * Update an existing contact person.
     */
    public function update(UpdateContactRequest $request, Contact $contact): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $updated = DB::transaction(function () use ($contact, $data, $user) {
            // If changing to primary, demote existing primary contacts
            if (isset($data['is_primary']) && $data['is_primary'] && !$contact->is_primary) {
                Contact::where('account_id', $contact->account_id)
                    ->where('id', '!=', $contact->id)
                    ->update(['is_primary' => false]);
            }

            $oldValues = $contact->toArray();
            $contact->update($data);

            AuditLogger::log(
                'Contact',
                $contact->id,
                'updated',
                null,
                $oldValues,
                $contact->fresh()->toArray(),
                $user?->id
            );

            return $contact->fresh(['account:id,organization_name,industry,location', 'owner:id,first_name,last_name,email']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Contact person updated successfully',
            'data' => $updated,
        ]);
    }

    /**
     * Set a contact as the primary point of contact for its account.
     */
    public function setPrimary(Contact $contact, Request $request): JsonResponse
    {
        $user = $request->user();

        DB::transaction(function () use ($contact, $user) {
            Contact::where('account_id', $contact->account_id)
                ->where('id', '!=', $contact->id)
                ->update(['is_primary' => false]);

            $contact->update(['is_primary' => true]);

            AuditLogger::log(
                'Contact',
                $contact->id,
                'marked_primary',
                'is_primary',
                false,
                true,
                $user?->id
            );
        });

        return response()->json([
            'success' => true,
            'message' => "{$contact->name} is now the primary contact for this account.",
            'data' => $contact->fresh(),
        ]);
    }

    /**
     * Soft delete a contact.
     */
    public function destroy(Contact $contact, Request $request): JsonResponse
    {
        $user = $request->user();
        $oldValues = $contact->toArray();
        $contact->delete();

        AuditLogger::log(
            'Contact',
            $contact->id,
            'deleted',
            null,
            $oldValues,
            null,
            $user?->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Contact person deleted successfully',
        ]);
    }
}
