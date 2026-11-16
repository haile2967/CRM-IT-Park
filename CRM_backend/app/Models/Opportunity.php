<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Opportunity extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = ['id'];

    protected $casts = [
        'probability' => 'float',
        'value' => 'float',
        'expected_close_date' => 'date',
        'closed_at' => 'datetime',
        'account_id' => 'integer',
        'owner_user_id' => 'integer',
        'opportunity_type_id' => 'integer',
        'stage_id' => 'integer',
        'lead_id' => 'integer',
    ];

    protected $appends = ['deal_name'];

    public function getDealNameAttribute(): string
    {
        $org = $this->account?->organization_name ?? 'Corporate Deal';
        $type = $this->opportunityType?->type_name ?? 'Commercial Opportunity';
        return "{$org} — {$type}";
    }

    // Relationships
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'account_id');
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class, 'lead_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function stage(): BelongsTo
    {
        return $this->belongsTo(PipelineStage::class, 'stage_id');
    }

    public function opportunityType(): BelongsTo
    {
        return $this->belongsTo(OpportunityType::class, 'opportunity_type_id');
    }

    public function stageHistories(): HasMany
    {
        return $this->hasMany(OpportunityStageHistory::class, 'opportunity_id')->orderBy('changed_at', 'desc');
    }

    public function exportRecords(): HasMany
    {
        return $this->hasMany(ExportRecord::class, 'opportunity_id')->orderBy('exported_at', 'desc');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class, 'opportunity_id')->orderBy('created_at', 'desc');
    }

    // Scopes
    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        $roleName = strtolower($user->role?->role_name ?? '');

        // CRM Managers and Admins have unrestricted visibility across all opportunities
        if (
            str_contains($roleName, 'admin') ||
            str_contains($roleName, 'manager') ||
            $user->hasRole('System Administrator') ||
            $user->hasRole('CRM Manager')
        ) {
            return $query;
        }

        // BDOs see deals they own or deals attached to accounts they own
        return $query->where(function ($q) use ($user) {
            $q->where('owner_user_id', $user->id)
              ->orWhereHas('account', function ($sub) use ($user) {
                  $sub->where('owner_user_id', $user->id);
              });
        });
    }

    public function scopeOpen(Builder $query): Builder
    {
        return $query->where('status', 'open');
    }

    public function scopeClosedWon(Builder $query): Builder
    {
        return $query->where('status', 'closed_won');
    }

    public function scopeClosedLost(Builder $query): Builder
    {
        return $query->where('status', 'closed_lost');
    }
}
