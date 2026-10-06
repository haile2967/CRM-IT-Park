<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    use HasFactory;

    protected $table = 'programs';
    protected $primaryKey = 'program_id';

    protected $fillable = [
        'program_name',
        'program_type',
        'description',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function applications()
    {
        return $this->hasMany(ProgramApplication::class, 'program_id', 'program_id');
    }

    public function events()
    {
        return $this->hasMany(Event::class, 'program_id', 'program_id');
    }
}
