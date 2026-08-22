<?php

namespace App\Models;

use Database\Factories\InvoiceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    /** @use HasFactory<InvoiceFactory> */
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'base_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'recurring_discount_val' => 'decimal:2',
        'manual_adjustment' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'notification_sent' => 'boolean',
        'due_date' => 'date',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function adjustments(): HasMany
    {
        return $this->hasMany(InvoiceAdjustment::class);
    }

    /**
     * Net signed adjustment for this invoice: +charges - credits.
     */
    public function netAdjustment(): float
    {
        return $this->adjustments()
            ->where('status', 'applied')
            ->get()
            ->reduce(fn (float $carry, InvoiceAdjustment $adj) => $carry + $adj->signedAmount(), 0.0);
    }

    /**
     * Recompute and persist the total amount from base + tax - recurring discount
     * plus the net of applied adjustments (charges - credits), clamped at >= 0.
     * Mirrors the net into manual_adjustment for backwards compatibility.
     */
    public function recomputeTotal(): static
    {
        $netAdjustment = $this->netAdjustment();
        $total = max(
            0,
            (float) $this->base_amount
            + (float) $this->tax_amount
            - (float) $this->recurring_discount_val
            + $netAdjustment
        );

        $this->update([
            'manual_adjustment' => round($netAdjustment, 2),
            'total_amount' => round($total, 2),
        ]);

        return $this;
    }
}
