<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EscalationPolicy extends Model
{
    use HasFactory;

    protected $table = 'escalation_policies';
    protected $primaryKey = 'escalation_policy_id';

    protected $fillable = [
        'priority',
        'reminder_threshold_minutes',
        'escalation_threshold_minutes',
        'time_basis',
        'is_active',
        'created_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'reminder_threshold_minutes' => 'integer',
            'escalation_threshold_minutes' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by_user_id', 'user_id');
    }

    public function recipients()
    {
        return $this->hasMany(EscalationRecipient::class, 'escalation_policy_id', 'escalation_policy_id');
    }

    public function escalationHistories()
    {
        return $this->hasMany(TicketEscalationHistory::class, 'escalation_policy_id', 'escalation_policy_id');
    }
}
