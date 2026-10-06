<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EscalationRecipient extends Model
{
    use HasFactory;

    protected $table = 'escalation_recipients';
    protected $primaryKey = 'escalation_recipient_id';

    protected $fillable = [
        'escalation_policy_id',
        'user_id',
        'role_id',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function policy()
    {
        return $this->belongsTo(EscalationPolicy::class, 'escalation_policy_id', 'escalation_policy_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id', 'role_id');
    }
}
