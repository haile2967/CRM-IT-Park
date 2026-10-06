<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Communication extends Model
{
    use HasFactory;

    const UPDATED_AT = null;
    protected $table = 'communications';
    protected $primaryKey = 'communication_id';

    protected $fillable = [
        'account_id',
        'contact_id',
        'lead_id',
        'opportunity_id',
        'activity_id',
        'created_by_user_id',
        'communication_type',
        'subject',
        'content',
        'communication_at',
    ];

    protected function casts(): array
    {
        return [
            'communication_at' => 'datetime',
            'created_at' => 'datetime',
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

    public function lead()
    {
        return $this->belongsTo(Lead::class, 'lead_id', 'lead_id');
    }

    public function opportunity()
    {
        return $this->belongsTo(Opportunity::class, 'opportunity_id', 'opportunity_id');
    }

    public function activity()
    {
        return $this->belongsTo(Activity::class, 'activity_id', 'activity_id');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'created_by_user_id', 'user_id');
    }
}
