<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contact extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'contacts';
    protected $primaryKey = 'contact_id';

    protected $fillable = [
        'account_id',
        'owner_user_id',
        'first_name',
        'last_name',
        'role_title',
        'phone',
        'email',
        'is_primary',
    ];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
            'deleted_at' => 'datetime',
        ];
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function account()
    {
        return $this->belongsTo(Account::class, 'account_id', 'account_id');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_user_id', 'user_id');
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'contact_id', 'contact_id');
    }

    public function activities()
    {
        return $this->hasMany(Activity::class, 'contact_id', 'contact_id');
    }

    public function communications()
    {
        return $this->hasMany(Communication::class, 'contact_id', 'contact_id');
    }

    public function programApplications()
    {
        return $this->hasMany(ProgramApplication::class, 'contact_id', 'contact_id');
    }
}
