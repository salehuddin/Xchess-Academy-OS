<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassSession extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'session_date' => 'date:Y-m-d',
    ];

    public function class(): BelongsTo
    {
        return $this->belongsTo(ChessClass::class, 'class_id');
    }

    public function coach(): BelongsTo
    {
        return $this->belongsTo(User::class, 'coach_id');
    }
}
