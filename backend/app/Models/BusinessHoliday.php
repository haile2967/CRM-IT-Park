<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessHoliday extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $table = 'business_holidays';
    protected $primaryKey = 'holiday_id';

    protected $fillable = [
        'calendar_id',
        'holiday_date',
        'holiday_name',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'holiday_date' => 'date',
            'created_at' => 'datetime',
        ];
    }

    public function calendar()
    {
        return $this->belongsTo(BusinessHoursCalendar::class, 'calendar_id', 'calendar_id');
    }
}
