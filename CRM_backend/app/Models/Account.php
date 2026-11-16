<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Account extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = ['id'];

    protected $casts = [
        'contact_information' => 'array',
    ];

    /**
     * Account owner (BDO or Manager).
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    /**
     * Account classification taxonomy.
     */
    public function accountType(): BelongsTo
    {
        return $this->belongsTo(ReferenceCategory::class, 'account_type_id');
    }

    /**
     * Contacts associated with this account.
     */
    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class, 'account_id');
    }

    /**
     * The designated primary point of contact.
     */
    public function primaryContact(): HasOne
    {
        return $this->hasOne(Contact::class, 'account_id')->where('is_primary', true);
    }

    /**
     * Commercial deals / opportunities.
     */
    public function opportunities(): HasMany
    {
        return $this->hasMany(Opportunity::class, 'account_id');
    }

    /**
     * Support tickets logged for this tenant account.
     */
    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'account_id');
    }

    /**
     * Logged activities (meetings, calls, tasks).
     */
    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class, 'account_id');
    }

    /**
     * Scope query to records visible to the authenticated user's role.
     * System Admin & CRM Manager see all; BDO sees assigned accounts.
     */
    public function scopeVisibleTo($query, ?User $user)
    {
        if (!$user) {
            return $query;
        }

        if ($user->hasRole(['System Administrator', 'CRM Manager'])) {
            return $query;
        }

        return $query->where('owner_user_id', $user->id);
    }
}
