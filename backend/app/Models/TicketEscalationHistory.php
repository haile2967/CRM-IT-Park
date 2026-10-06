<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketEscalationHistory extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $table = 'ticket_escalation_history';
    protected $primaryKey = 'escalation_history_id';

    protected $fillable = [
        'ticket_id',
        'escalation_policy_id',
        'escalated_at',
        'cleared_at',
        'inactivity_duration_minutes',
        'notification_sent',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'escalated_at' => 'datetime',
            'cleared_at' => 'datetime',
            'inactivity_duration_minutes' => 'integer',
            'notification_sent' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'ticket_id', 'ticket_id');
    }

    public function policy()
    {
        return $this->belongsTo(EscalationPolicy::class, 'escalation_policy_id', 'escalation_policy_id');
    }
}
