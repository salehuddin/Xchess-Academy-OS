<?php

namespace App\Models;

use Database\Factories\AttendanceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    /** @use HasFactory<AttendanceFactory> */
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'is_present' => 'boolean',
        'manual_discount_pending' => 'boolean',
        'attendance_date' => 'date:Y-m-d',
    ];

    public function class(): BelongsTo
    {
        return $this->belongsTo(ChessClass::class, 'class_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
