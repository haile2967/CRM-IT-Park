<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Opportunity extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'opportunities';
    protected $primaryKey = 'opportunity_id';

    protected $fillable = [
        'lead_id',
        'account_id',
        'owner_user_id',
        'opportunity_type_id',
        'stage_id',
        'probability',
        'value',
        'expected_close_date',
        'notes',
        'status',
        'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'probability' => 'decimal:2',
            'value' => 'decimal:2',
            'expected_close_date' => 'date',
            'closed_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class, 'lead_id', 'lead_id');
    }

    public function account()
    {
        return $this->belongsTo(Account::class, 'account_id', 'account_id');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_user_id', 'user_id');
    }

    public function type()
    {
        return $this->belongsTo(OpportunityType::class, 'opportunity_type_id', 'opportunity_type_id');
    }

    public function stage()
    {
        return $this->belongsTo(PipelineStage::class, 'stage_id', 'stage_id');
    }

    public function stageHistories()
    {
        return $this->hasMany(OpportunityStageHistory::class, 'opportunity_id', 'opportunity_id')->orderBy('changed_at', 'desc');
    }

    public function activities()
    {
        return $this->hasMany(Activity::class, 'opportunity_id', 'opportunity_id');
    }

    public function communications()
    {
        return $this->hasMany(Communication::class, 'opportunity_id', 'opportunity_id');
    }

    public function programApplications()
    {
        return $this->hasMany(ProgramApplication::class, 'opportunity_id', 'opportunity_id');
    }

    public function exportRecords()
    {
        return $this->hasMany(ExportRecord::class, 'opportunity_id', 'opportunity_id');
    }

    // Status helpers
    public function isClosedWon(): bool
    {
        return $this->status === 'closed_won';
    }

    public function isClosedLost(): bool
    {
        return $this->status === 'closed_lost';
    }

    public function isOpen(): bool
    {
        return $this->status === 'open';
    }
}
