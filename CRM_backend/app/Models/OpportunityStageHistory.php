<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OpportunityStageHistory extends Model
{
    use HasFactory;

    protected $table = 'opportunity_stage_history';

    protected $guarded = ['id'];
    public $timestamps = false;

    protected $casts = [
        'changed_at' => 'datetime',
        'opportunity_id' => 'integer',
        'from_stage_id' => 'integer',
        'to_stage_id' => 'integer',
        'changed_by_user_id' => 'integer',
    ];

    public function opportunity(): BelongsTo
    {
        return $this->belongsTo(Opportunity::class, 'opportunity_id');
    }

    public function fromStage(): BelongsTo
    {
        return $this->belongsTo(PipelineStage::class, 'from_stage_id');
    }

    public function toStage(): BelongsTo
    {
        return $this->belongsTo(PipelineStage::class, 'to_stage_id');
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by_user_id');
    }
}
