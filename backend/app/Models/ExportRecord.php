<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExportRecord extends Model
{
    use HasFactory;

    protected $table = 'export_records';
    protected $primaryKey = 'export_record_id';

    public $timestamps = false;

    protected $fillable = [
        'opportunity_id',
        'exported_by_user_id',
        'export_type',
        'export_format',
        'file_name',
        'record_count',
        'status',
        'exported_at',
        'error_message',
    ];

    protected $casts = [
        'exported_at' => 'datetime',
        'record_count' => 'integer',
    ];

    public function opportunity(): BelongsTo
    {
        return $this->belongsTo(Opportunity::class, 'opportunity_id', 'opportunity_id');
    }

    public function exportedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'exported_by_user_id', 'user_id');
    }
}
