<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Illuminate\\Foundation\\Auth\\User as Authenticatable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $guarded = ['id'];

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

}
