<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayrollLineItem extends Model
{
    protected $fillable = [
        'payroll_id',
        'class_id',
        'class_name',
        'package_title',
        'attendance_date',
        'rate',
    ];

    protected $casts = [
        'attendance_date' => 'date:Y-m-d',
        'rate' => 'decimal:2',
    ];

    public function payroll(): BelongsTo
    {
        return $this->belongsTo(Payroll::class);
    }
}
