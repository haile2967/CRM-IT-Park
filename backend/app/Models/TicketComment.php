<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketComment extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $table = 'ticket_comments';
    protected $primaryKey = 'ticket_comment_id';

    protected $fillable = [
        'ticket_id',
        'user_id',
        'comment_text',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'ticket_id', 'ticket_id');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
