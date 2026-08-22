<?php

namespace App\Models;

use Database\Factories\InvoiceAdjustmentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceAdjustment extends Model
{
    /** @use HasFactory<InvoiceAdjustmentFactory> */
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function appliedFrom(): BelongsTo
    {
        return $this->belongsTo(Invoice::class, 'applied_from_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Signed amount: positive for charges, negative for credits (deductions/refunds).
     */
    public function signedAmount(): float
    {
        return $this->type === 'charge' ? (float) $this->amount : -1 * (float) $this->amount;
    }
}
