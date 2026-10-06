<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory;

    protected $table = 'activities';
    protected $primaryKey = 'activity_id';

    protected $fillable = [
        'assigned_user_id',
        'lead_id',
        'account_id',
        'contact_id',
        'opportunity_id',
        'activity_type',
        'subject',
        'description',
        'scheduled_at',
        'completed_at',
        'reminder_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'completed_at' => 'datetime',
            'reminder_at' => 'datetime',
        ];
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_user_id', 'user_id');
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class, 'lead_id', 'lead_id');
    }

    public function account()
    {
        return $this->belongsTo(Account::class, 'account_id', 'account_id');
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class, 'contact_id', 'contact_id');
    }

    public function opportunity()
    {
        return $this->belongsTo(Opportunity::class, 'opportunity_id', 'opportunity_id');
    }

    public function communications()
    {
        return $this->hasMany(Communication::class, 'activity_id', 'activity_id');
    }
}
