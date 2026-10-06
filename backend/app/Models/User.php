<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $primaryKey = 'user_id';

    protected $fillable = [
        'role_id',
        'first_name',
        'last_name',
        'email',
        'password',
        'phone',
        'status',
        'last_login_at',
        'deactivated_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'deactivated_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function getNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    // Role relationship
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id', 'role_id');
    }

    // Role helpers (§3.2 & §3.3)
    public function isCrmManager(): bool
    {
        return $this->role?->role_name === 'CRM Manager';
    }

    public function isBdo(): bool
    {
        return $this->role?->role_name === 'Business Development Officer';
    }

    public function isSupportAgent(): bool
    {
        return $this->role?->role_name === 'Support Agent';
    }

    public function isAdmin(): bool
    {
        return $this->role?->role_name === 'System Administrator';
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    // Domain relationships
    public function ownedLeads()
    {
        return $this->hasMany(Lead::class, 'owner_user_id', 'user_id');
    }

    public function ownedAccounts()
    {
        return $this->hasMany(Account::class, 'owner_user_id', 'user_id');
    }

    public function ownedContacts()
    {
        return $this->hasMany(Contact::class, 'owner_user_id', 'user_id');
    }

    public function ownedOpportunities()
    {
        return $this->hasMany(Opportunity::class, 'owner_user_id', 'user_id');
    }

    public function assignedTickets()
    {
        return $this->hasMany(Ticket::class, 'assignee_user_id', 'user_id');
    }

    public function assignedActivities()
    {
        return $this->hasMany(Activity::class, 'assigned_user_id', 'user_id');
    }
}
