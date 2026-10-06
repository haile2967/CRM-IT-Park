<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PipelineStage extends Model
{
    use HasFactory;

    protected $table = 'pipeline_stages';
    protected $primaryKey = 'stage_id';

    protected $fillable = [
        'stage_name',
        'display_order',
        'is_closed_won',
        'is_closed_lost',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'display_order' => 'integer',
            'is_closed_won' => 'boolean',
            'is_closed_lost' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function opportunities()
    {
        return $this->hasMany(Opportunity::class, 'stage_id', 'stage_id');
    }

    public function isTerminal(): bool
    {
        return $this->is_closed_won || $this->is_closed_lost;
    }
}
