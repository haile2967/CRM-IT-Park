<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OpportunityStageHistory extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $table = 'opportunity_stage_history';
    protected $primaryKey = 'history_id';

    protected $fillable = [
        'opportunity_id',
        'from_stage_id',
        'to_stage_id',
        'changed_by_user_id',
        'changed_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'changed_at' => 'datetime',
        ];
    }

    public function opportunity()
    {
        return $this->belongsTo(Opportunity::class, 'opportunity_id', 'opportunity_id');
    }

    public function fromStage()
    {
        return $this->belongsTo(PipelineStage::class, 'from_stage_id', 'stage_id');
    }

    public function toStage()
    {
        return $this->belongsTo(PipelineStage::class, 'to_stage_id', 'stage_id');
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by_user_id', 'user_id');
    }
}
