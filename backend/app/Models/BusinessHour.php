<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessHour extends Model
{
    use HasFactory;

    protected $table = 'business_hours';
    protected $primaryKey = 'business_hour_id';

    protected $fillable = [
        'calendar_id',
        'day_of_week',
        'start_time',
        'end_time',
        'is_working_day',
    ];

    protected function casts(): array
    {
        return [
            'day_of_week' => 'integer',
            'is_working_day' => 'boolean',
        ];
    }

    public function calendar()
    {
        return $this->belongsTo(BusinessHoursCalendar::class, 'calendar_id', 'calendar_id');
    }
}
