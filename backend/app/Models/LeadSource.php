<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadSource extends Model
{
    use HasFactory;

    protected $table = 'lead_sources';
    protected $primaryKey = 'source_id';

    protected $fillable = [
        'source_name',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function leads()
    {
        return $this->hasMany(Lead::class, 'source_id', 'source_id');
    }
}
