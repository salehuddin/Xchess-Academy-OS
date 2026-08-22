<?php

namespace App\Models;

use Carbon\Carbon;
use Database\Factories\StudentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    /** @use HasFactory<StudentFactory> */
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    protected $appends = ['age'];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(StudentParent::class, 'parent_id');
    }

    /**
     * Computed age label in the form "9y 5m". Returns null when no birthdate is set.
     */
    public function getAgeAttribute(): ?string
    {
        if (! $this->date_of_birth) {
            return null;
        }

        $now = Carbon::now();
        $dob = Carbon::instance($this->date_of_birth);

        $years = (int) $dob->diffInYears($now);
        $months = (int) $dob->copy()->addYears($years)->diffInMonths($now);

        if ($years > 0 && $months > 0) {
            return "{$years}y {$months}m";
        } elseif ($years > 0) {
            return "{$years}y";
        }

        return "{$months}m";
    }

    public function classes(): BelongsToMany
    {
        return $this->belongsToMany(ChessClass::class, 'student_classes', 'student_id', 'class_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }
}
