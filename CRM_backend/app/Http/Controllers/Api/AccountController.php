<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\StoreAccountRequest;
use App\Http\Requests\Account\UpdateAccountRequest;
use App\Models\Account;
use App\Models\Contact;
use App\Models\ReferenceCategory;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AccountController extends Controller
{
    /**
     * List accounts with search, role-based filtering, and KPI statistics.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Account::query()
            ->visibleTo($user)
            ->with([
                'owner:id,first_name,last_name,email',
                'accountType:id,category_name,category_group',
                'primaryContact',
            ])
            ->withCount(['contacts', 'opportunities', 'tickets']);

        // Search by organization name, industry, location, or primary contact
        if ($search = $request->input('search')) {
            $search = trim($search);
            $query->where(function ($q) use ($search) {
                $q->where('organization_name', 'ilike', "%{$search}%")
                  ->orWhere('industry', 'ilike', "%{$search}%")
                  ->orWhere('location', 'ilike', "%{$search}%")
                  ->orWhereHas('contacts', function ($contactQuery) use ($search) {
                      $contactQuery->where('first_name', 'ilike', "%{$search}%")
                                   ->orWhere('last_name', 'ilike', "%{$search}%")
                                   ->orWhere('email', 'ilike', "%{$search}%");
                  });
            });
        }

        // Filter by Account Type
        if ($typeId = $request->input('account_type_id')) {
            if ($typeId !== 'all') {
                $query->where('account_type_id', $typeId);
            }
        }

        // Filter by Owner
        if ($request->has('owner_user_id')) {
            $ownerId = $request->input('owner_user_id');
            if ($ownerId === 'unassigned') {
                $query->whereNull('owner_user_id');
            } elseif ($ownerId && $ownerId !== 'all') {
                $query->where('owner_user_id', $ownerId);
            }
        }

        // Filter by Industry / Sector
        if ($industry = $request->input('industry')) {
            if ($industry !== 'all') {
                $query->where('industry', $industry);
            }
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = strtolower($request->input('sort_direction', 'desc')) === 'asc' ? 'asc' : 'desc';
        $allowedSorts = ['organization_name', 'created_at', 'industry', 'location'];

        if (in_array($sortBy, $allowedSorts, true)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);
        $accounts = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $accounts->items(),
            'meta' => [
                'current_page' => $accounts->currentPage(),
                'last_page' => $accounts->lastPage(),
                'per_page' => $accounts->perPage(),
                'total' => $accounts->total(),
            ],
        ]);
    }

    /**
     * Compute summary KPI metrics for accounts.
     */
    public function metrics(Request $request): JsonResponse
    {
        $user = $request->user();
        $base = Account::query()->visibleTo($user);

        $totalAccounts = (clone $base)->count();
        $unassignedAccounts = (clone $base)->whereNull('owner_user_id')->count();

        // Count by Account Type
        $incubateeType = ReferenceCategory::where('category_group', 'account_type')
            ->where('category_name', 'Startup Incubatee')->first();
        $tenantType = ReferenceCategory::where('category_group', 'account_type')
            ->where('category_name', 'Commercial Park Tenant')->first();
        $partnerType = ReferenceCategory::where('category_group', 'account_type')
            ->where('category_name', 'Strategic Partner / Investor')->first();

        $commercialTenants = $tenantType ? (clone $base)->where('account_type_id', $tenantType->id)->count() : 0;
        $startupIncubatees = $incubateeType ? (clone $base)->where('account_type_id', $incubateeType->id)->count() : 0;
        $partnersInvestors = $partnerType ? (clone $base)->where('account_type_id', $partnerType->id)->count() : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $totalAccounts,
                'commercial_tenants' => $commercialTenants,
                'startup_incubatees' => $startupIncubatees,
                'partners_investors' => $partnersInvestors,
                'unassigned' => $unassignedAccounts,
            ],
        ]);
    }

    /**
     * Show account details with linked contacts, opportunities, and activities.
     */
    public function show(Account $account, Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole(['System Administrator', 'CRM Manager']) && $account->owner_user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized to view this account.'], 403);
        }

        $account->load([
            'owner:id,first_name,last_name,email,phone',
            'accountType:id,category_name,description',
            'contacts' => fn($q) => $q->orderBy('is_primary', 'desc')->orderBy('first_name'),
            'opportunities.stage',
            'tickets' => fn($q) => $q->limit(10),
            'activities' => fn($q) => $q->orderBy('created_at', 'desc')->limit(10),
        ]);

        return response()->json([
            'success' => true,
            'data' => $account,
        ]);
    }

    /**
     * Create a new Corporate Account (with optional inline primary contact).
     */
    public function store(StoreAccountRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $account = DB::transaction(function () use ($data, $user) {
            $primaryContactData = $data['primary_contact'] ?? null;
            unset($data['primary_contact']);

            if (!isset($data['owner_user_id']) || empty($data['owner_user_id'])) {
                $data['owner_user_id'] = $user->id;
            }

            $createdAccount = Account::create($data);

            if ($primaryContactData) {
                Contact::create([
                    'account_id' => $createdAccount->id,
                    'owner_user_id' => $createdAccount->owner_user_id,
                    'first_name' => $primaryContactData['first_name'],
                    'last_name' => $primaryContactData['last_name'],
                    'role_title' => $primaryContactData['role_title'] ?? 'Primary Contact',
                    'email' => $primaryContactData['email'] ?? null,
                    'phone' => $primaryContactData['phone'] ?? null,
                    'is_primary' => true,
                ]);
            }

            AuditLogger::log(
                'Account',
                $createdAccount->id,
                'created',
                null,
                null,
                $createdAccount->toArray(),
                $user?->id
            );

            return $createdAccount;
        });

        $account->load(['owner:id,first_name,last_name,email', 'accountType', 'primaryContact']);

        return response()->json([
            'success' => true,
            'message' => 'Corporate Account created successfully',
            'data' => $account,
        ], 201);
    }

    /**
     * Update an existing account profile.
     */
    public function update(UpdateAccountRequest $request, Account $account): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole(['System Administrator', 'CRM Manager']) && $account->owner_user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized to update this account.'], 403);
        }

        $oldValues = $account->toArray();
        $account->update($request->validated());

        AuditLogger::log(
            'Account',
            $account->id,
            'updated',
            null,
            $oldValues,
            $account->fresh()->toArray(),
            $user?->id
        );

        $account->load(['owner:id,first_name,last_name,email', 'accountType', 'primaryContact']);

        return response()->json([
            'success' => true,
            'message' => 'Corporate Account updated successfully',
            'data' => $account,
        ]);
    }

    /**
     * Soft delete an account with integrity verification.
     */
    public function destroy(Account $account, Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole(['System Administrator', 'CRM Manager'])) {
            return response()->json(['message' => 'Only CRM Managers and Administrators can delete accounts.'], 403);
        }

        // Integrity safeguard: check active open opportunities
        $openOpportunitiesCount = $account->opportunities()->where('status', 'open')->count();
        if ($openOpportunitiesCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Cannot delete account: It has {$openOpportunitiesCount} active open commercial deal(s). Please reassign or close them first.",
            ], 422);
        }

        $oldValues = $account->toArray();
        $account->delete();

        AuditLogger::log(
            'Account',
            $account->id,
            'deleted',
            null,
            $oldValues,
            null,
            $user?->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Corporate Account deleted successfully',
        ]);
    }

    /**
     * Transfer Account Ownership (BR-002).
     */
    public function transferOwnership(Request $request, Account $account): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole(['System Administrator', 'CRM Manager']) && $account->owner_user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized to transfer account ownership.'], 403);
        }

        $request->validate([
            'owner_user_id' => 'required|exists:users,id',
        ]);

        $oldOwner = $account->owner_user_id;
        $newOwner = $request->input('owner_user_id');

        $account->update(['owner_user_id' => $newOwner]);

        AuditLogger::log(
            'Account',
            $account->id,
            'ownership_transferred',
            'owner_user_id',
            $oldOwner,
            $newOwner,
            $user?->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Account ownership transferred successfully',
            'data' => $account->fresh(['owner:id,first_name,last_name,email']),
        ]);
    }
}
