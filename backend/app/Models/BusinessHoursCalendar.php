<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessHoursCalendar extends Model
{
    use HasFactory;

    protected $table = 'business_hours_calendars';
    protected $primaryKey = 'calendar_id';

    protected $fillable = [
        'calendar_name',
        'timezone',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function hours()
    {
        return $this->hasMany(BusinessHour::class, 'calendar_id', 'calendar_id');
    }

    public function holidays()
    {
        return $this->hasMany(BusinessHoliday::class, 'calendar_id', 'calendar_id');
    }
}
