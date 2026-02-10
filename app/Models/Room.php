<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    /** @use HasFactory<\Database\Factories\RoomFactory> */
    use HasFactory;

    protected $guarded = [];

    public function schedules(): HasMany
    {
        return $this->hasMany(ClassSchedule::class);
    }

    public function classes(): HasMany
    {
        return $this->hasMany(ChessClass::class);
    }
}
