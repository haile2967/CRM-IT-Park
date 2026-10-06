<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lead extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'leads';
    protected $primaryKey = 'lead_id';

    protected $fillable = [
        'owner_user_id',
        'name',
        'organization',
        'email',
        'phone',
        'source_id',
        'category_id',
        'status',
        'notes',
        'converted_at',
    ];

    protected function casts(): array
    {
        return [
            'converted_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_user_id', 'user_id');
    }

    public function source()
    {
        return $this->belongsTo(LeadSource::class, 'source_id', 'source_id');
    }

    public function category()
    {
        return $this->belongsTo(ReferenceCategory::class, 'category_id', 'category_id');
    }

    public function opportunities()
    {
        return $this->hasMany(Opportunity::class, 'lead_id', 'lead_id');
    }

    public function activities()
    {
        return $this->hasMany(Activity::class, 'lead_id', 'lead_id');
    }

    public function communications()
    {
        return $this->hasMany(Communication::class, 'lead_id', 'lead_id');
    }

    // Status helpers
    public function isQualified(): bool
    {
        return $this->status === 'qualified';
    }

    public function isConverted(): bool
    {
        return !is_null($this->converted_at);
    }
}
