<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Payroll extends Model
{
    protected $fillable = [
        'coach_id',
        'month_year',
        'total_sessions',
        'base_rate',
        'total_amount',
        'status',
        'generated_at',
    ];

    protected $casts = [
        'total_sessions' => 'integer',
        'base_rate' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'generated_at' => 'datetime',
    ];

    public function coach(): BelongsTo
    {
        return $this->belongsTo(User::class, 'coach_id');
    }

    public function lineItems(): HasMany
    {
        return $this->hasMany(PayrollLineItem::class);
    }
}
