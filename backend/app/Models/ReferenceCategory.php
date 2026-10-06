<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReferenceCategory extends Model
{
    use HasFactory;

    protected $table = 'reference_categories';
    protected $primaryKey = 'category_id';

    protected $fillable = [
        'category_group',
        'category_name',
        'description',
        'is_active',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'display_order' => 'integer',
        ];
    }

    public function accounts()
    {
        return $this->hasMany(Account::class, 'account_type_id', 'category_id');
    }

    public function leads()
    {
        return $this->hasMany(Lead::class, 'category_id', 'category_id');
    }

    // Scopes for groups
    public function scopeGroup($query, string $group)
    {
        return $query->where('category_group', $group);
    }
}
