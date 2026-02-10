<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CoachProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nric',
        'phone',
        'bank_name',
        'bank_account_name',
        'bank_account_number',
        'level',
        'hourly_rate',
        'availability',
    ];

    protected $casts = [
        'availability' => 'array',
        'hourly_rate' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
