<?php

namespace App\Models;

use App\Enums\TicketPriority;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ticket extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = ['id'];

    protected $appends = [
        'ticket_number',
        'inactivity_state',
        'elapsed_inactivity_minutes',
    ];

    protected function casts(): array
    {
        return [
            'priority' => TicketPriority::class,
            'escalated' => 'boolean',
            'last_activity_at' => 'datetime',
            'escalated_at' => 'datetime',
            'closed_at' => 'datetime',
            'account_id' => 'integer',
            'contact_id' => 'integer',
            'assignee_user_id' => 'integer',
            'category_id' => 'integer',
            'inactivity_duration_seconds' => 'integer',
        ];
    }

    public function getTicketNumberAttribute(): string
    {
        return 'TICK-' . str_pad($this->id, 5, '0', STR_PAD_LEFT);
    }

    public function getElapsedInactivityMinutesAttribute(): int
    {
        $lastAction = $this->last_activity_at ?? $this->created_at ?? now();
        return (int) round(abs(now()->diffInMinutes($lastAction)));
    }

    public function getInactivityStateAttribute(): string
    {
        if (in_array($this->status, ['resolved', 'closed'])) {
            return 'resolved';
        }

        if ($this->escalated) {
            return 'escalated';
        }

        $minutes = $this->elapsed_inactivity_minutes;

        // Dynamic aging thresholds based on priority
        $priorityVal = $this->priority instanceof TicketPriority ? $this->priority->value : $this->priority;
        $agingThreshold = match ($priorityVal) {
            'Urgent' => 60,   // 1 hour
            'High' => 180,    // 3 hours
            'Medium' => 480,  // 8 hours
            default => 720,   // 12 hours
        };

        if ($minutes < $agingThreshold) {
            return 'recent';
        }

        return 'aging';
    }

    // Relationships
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'account_id');
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'contact_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_user_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(TicketCategory::class, 'category_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TicketComment::class, 'ticket_id')->orderBy('created_at', 'asc');
    }

    public function escalationHistories(): HasMany
    {
        return $this->hasMany(TicketEscalationHistory::class, 'ticket_id')->orderBy('escalated_at', 'desc');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class, 'ticket_id')->orderBy('created_at', 'desc');
    }

    // Scopes
    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        $roleName = strtolower($user->role?->role_name ?? '');

        // Administrators and CRM Managers have unrestricted visibility across all tickets
        if (
            str_contains($roleName, 'admin') ||
            str_contains($roleName, 'manager') ||
            $user->hasRole(['System Administrator', 'CRM Manager'])
        ) {
            return $query;
        }

        // Support Agents see: tickets assigned to them OR tickets in the shared unassigned queue
        if (str_contains($roleName, 'support') || $user->hasRole('Support Agent')) {
            return $query->where(function ($q) use ($user) {
                $q->where('assignee_user_id', $user->id)
                  ->orWhereNull('assignee_user_id');
            });
        }

        // BDOs see tickets linked to their owned accounts
        return $query->whereHas('account', function ($sub) use ($user) {
            $sub->where('owner_user_id', $user->id);
        });
    }

    public function scopeUnassigned(Builder $query): Builder
    {
        return $query->whereNull('assignee_user_id');
    }

    public function scopeEscalated(Builder $query): Builder
    {
        return $query->where('escalated', true);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('status', ['open', 'in_progress']);
    }

    public function scopeResolved(Builder $query): Builder
    {
        return $query->whereIn('status', ['resolved', 'closed']);
    }
}
