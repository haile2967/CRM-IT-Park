<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lead extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = ['id'];

    protected $casts = [
        'converted_at' => 'datetime',
        'next_follow_up_at' => 'datetime',
        'lead_score' => 'integer',
        'estimated_space_sqm' => 'decimal:2',
        'estimated_headcount' => 'integer',
    ];

    /**
     * Canonical Lead Statuses
     */
    public const STATUS_NEW = 'new';
    public const STATUS_CONTACTED = 'contacted';
    public const STATUS_QUALIFIED = 'qualified';
    public const STATUS_UNQUALIFIED = 'unqualified';
    public const STATUS_CONVERTED = 'converted';

    public const VALID_STATUSES = [
        self::STATUS_NEW,
        self::STATUS_CONTACTED,
        self::STATUS_QUALIFIED,
        self::STATUS_UNQUALIFIED,
        self::STATUS_CONVERTED,
    ];

    /**
     * Relationship: Assigned Owner (User)
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    /**
     * Relationship: Lead Source (e.g. Website, Referral, Direct Outreach)
     */
    public function source(): BelongsTo
    {
        return $this->belongsTo(LeadSource::class, 'source_id');
    }

    /**
     * Relationship: Reference Category / Sector (e.g. Fintech, BPO)
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ReferenceCategory::class, 'category_id');
    }

    /**
     * Relationship: Associated Activities & Touchpoints
     */
    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class, 'lead_id')->orderBy('created_at', 'desc');
    }

    /**
     * Relationship: Associated Communications (Emails, Calls, Logs)
     */
    public function communications(): HasMany
    {
        return $this->hasMany(Communication::class, 'lead_id')->orderBy('sent_at', 'desc');
    }

    /**
     * Relationship: Converted Corporate Account
     */
    public function convertedAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'converted_account_id');
    }

    /**
     * Relationship: Converted Contact
     */
    public function convertedContact(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'converted_contact_id');
    }

    /**
     * Relationship: Converted Opportunity
     */
    public function convertedOpportunity(): BelongsTo
    {
        return $this->belongsTo(Opportunity::class, 'converted_opportunity_id');
    }

    /**
     * Scope: Full-text Search over Name, Organization, Email, and Phone
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (blank($term)) {
            return $query;
        }

        $term = '%' . trim($term) . '%';
        return $query->where(function (Builder $q) use ($term) {
            $q->where('name', 'ILIKE', $term)
              ->orWhere('organization', 'ILIKE', $term)
              ->orWhere('email', 'ILIKE', $term)
              ->orWhere('phone', 'ILIKE', $term)
              ->orWhere('notes', 'ILIKE', $term);
        });
    }

    /**
     * Scope: Filter by Status
     */
    public function scopeByStatus(Builder $query, ?string $status): Builder
    {
        if (blank($status) || $status === 'all') {
            return $query;
        }

        return $query->where('status', strtolower($status));
    }

    /**
     * Scope: Filter by Assigned Owner
     */
    public function scopeByOwner(Builder $query, $ownerId): Builder
    {
        if (blank($ownerId)) {
            return $query;
        }

        if ($ownerId === 'unassigned') {
            return $query->whereNull('owner_user_id');
        }

        return $query->where('owner_user_id', $ownerId);
    }

    /**
     * Scope: Filter by Priority
     */
    public function scopeByPriority(Builder $query, ?string $priority): Builder
    {
        if (blank($priority) || $priority === 'all') {
            return $query;
        }

        return $query->where('priority', strtolower($priority));
    }

    /**
     * Scope: Role-based Visibility (SRS §3.3)
     * System Administrators and CRM Managers see all leads.
     * Business Development Officers see assigned leads + unassigned leads.
     */
    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        if ($user->hasRole(['System Administrator', 'CRM Manager'])) {
            return $query;
        }

        // BDOs see their assigned leads plus newly unassigned inbound leads
        return $query->where(function (Builder $q) use ($user) {
            $q->where('owner_user_id', $user->id)
              ->orWhereNull('owner_user_id');
        });
    }

    /**
     * Helper: Check if lead has breached SLA (>48h in 'new' status without contact)
     */
    public function hasBreachedSla(): bool
    {
        return $this->status === self::STATUS_NEW
            && $this->created_at->diffInHours(now()) >= 48;
    }
}
