<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgramApplication extends Model
{
    use HasFactory;

    protected $table = 'program_applications';
    protected $primaryKey = 'application_id';

    protected $fillable = [
        'program_id',
        'account_id',
        'contact_id',
        'opportunity_id',
        'application_date',
        'status',
        'progress_notes',
        'engagement_notes',
        'completed_at',
        'withdrawn_at',
    ];

    protected $casts = [
        'application_date' => 'date',
        'completed_at' => 'datetime',
        'withdrawn_at' => 'datetime',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class, 'program_id', 'program_id');
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'account_id', 'account_id');
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'contact_id', 'contact_id');
    }

    public function opportunity(): BelongsTo
    {
        return $this->belongsTo(Opportunity::class, 'opportunity_id', 'opportunity_id');
    }
}
