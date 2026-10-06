<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OpportunityType extends Model
{
    use HasFactory;

    protected $table = 'opportunity_types';
    protected $primaryKey = 'opportunity_type_id';

    protected $fillable = [
        'type_name',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function opportunities()
    {
        return $this->hasMany(Opportunity::class, 'opportunity_type_id', 'opportunity_type_id');
    }
}
