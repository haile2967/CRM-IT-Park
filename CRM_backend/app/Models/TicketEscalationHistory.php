<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TicketEscalationHistory extends Model
{
    use HasFactory;

    protected $table = 'ticket_escalation_history';

    protected $guarded = ['id'];

    protected $casts = [
        'escalated_at' => 'datetime',
        'cleared_at' => 'datetime',
        'notification_sent' => 'boolean',
        'ticket_id' => 'integer',
        'escalation_policy_id' => 'integer',
        'inactivity_duration_minutes' => 'integer',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class, 'ticket_id');
    }

    public function policy(): BelongsTo
    {
        return $this->belongsTo(EscalationPolicy::class, 'escalation_policy_id');
    }
}
