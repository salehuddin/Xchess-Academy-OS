<?php

namespace App\Models;

use Database\Factories\RoomFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    /** @use HasFactory<RoomFactory> */
    use HasFactory;

    protected $guarded = [];

    public function classes(): HasMany
    {
        return $this->hasMany(ChessClass::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(ChessClass::class);
    }
}
