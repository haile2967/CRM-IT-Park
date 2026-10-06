<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Account extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'accounts';
    protected $primaryKey = 'account_id';

    protected $fillable = [
        'owner_user_id',
        'organization_name',
        'account_type_id',
        'industry',
        'location',
        'contact_information',
        'engagement_history',
    ];

    protected function casts(): array
    {
        return [
            'deleted_at' => 'datetime',
        ];
    }

    // Owner (BDO / CRM Manager)
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_user_id', 'user_id');
    }

    // Account category (Startup, Investor, Partner, etc.)
    public function accountType()
    {
        return $this->belongsTo(ReferenceCategory::class, 'account_type_id', 'category_id');
    }

    // Contacts associated with Account
    public function contacts()
    {
        return $this->hasMany(Contact::class, 'account_id', 'account_id');
    }

    // Designated Primary Contact (FR-ACCOUNT-005)
    public function primaryContact()
    {
        return $this->hasOne(Contact::class, 'account_id', 'account_id')->where('is_primary', true);
    }

    // Deals / Opportunities
    public function opportunities()
    {
        return $this->hasMany(Opportunity::class, 'account_id', 'account_id');
    }

    // Support tickets
    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'account_id', 'account_id');
    }

    // Activities & Communications
    public function activities()
    {
        return $this->hasMany(Activity::class, 'account_id', 'account_id');
    }

    public function communications()
    {
        return $this->hasMany(Communication::class, 'account_id', 'account_id');
    }

    // Programs & Event registrations
    public function programApplications()
    {
        return $this->hasMany(ProgramApplication::class, 'account_id', 'account_id');
    }

    public function eventRegistrations()
    {
        return $this->hasMany(EventRegistration::class, 'account_id', 'account_id');
    }
}
