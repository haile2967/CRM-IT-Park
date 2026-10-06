<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ticket extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tickets';
    protected $primaryKey = 'ticket_id';

    protected $fillable = [
        'account_id',
        'contact_id',
        'assignee_user_id',
        'category_id',
        'priority',
        'status',
        'subject',
        'description',
        'last_activity_at',
        'inactivity_duration_seconds',
        'escalated',
        'escalated_at',
        'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'last_activity_at' => 'datetime',
            'inactivity_duration_seconds' => 'integer',
            'escalated' => 'boolean',
            'escalated_at' => 'datetime',
            'closed_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    public function account()
    {
        return $this->belongsTo(Account::class, 'account_id', 'account_id');
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class, 'contact_id', 'contact_id');
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assignee_user_id', 'user_id');
    }

    public function category()
    {
        return $this->belongsTo(TicketCategory::class, 'category_id', 'category_id');
    }

    public function comments()
    {
        return $this->hasMany(TicketComment::class, 'ticket_id', 'ticket_id')->orderBy('created_at', 'asc');
    }

    public function escalationHistories()
    {
        return $this->hasMany(TicketEscalationHistory::class, 'ticket_id', 'ticket_id')->orderBy('escalated_at', 'desc');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'ticket_id', 'ticket_id');
    }

    // Status & Escalation helpers
    public function isUnassigned(): bool
    {
        return is_null($this->assignee_user_id);
    }

    public function isClosed(): bool
    {
        return in_array($this->status, ['resolved', 'closed']);
    }

    public function isEscalated(): bool
    {
        return (bool) $this->escalated;
    }
}
