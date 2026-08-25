<?php

namespace App\Models;

use Database\Factories\InvoiceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

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

    protected static function booted()
    {
        static::creating(function (Invoice $invoice) {
            if (empty($invoice->invoice_number)) {
                $invoice->invoice_number = static::nextNumberFor($invoice->month_year);
            }
        });
    }

    /**
     * Next sequential invoice number for a billing month.
     *
     * Format: INV-YYYYMM-##### (e.g. INV-202608-00042), unique per month.
     * The fixed-width sequence keeps lexical ordering correct, and the
     * row lock serializes concurrent generators.
     */
    public static function nextNumberFor(string $monthYear): string
    {
        $stamp = str_replace('-', '', $monthYear);
        $prefix = 'INV-'.$stamp.'-';

        return DB::transaction(function () use ($prefix) {
            $last = static::query()
                ->where('invoice_number', 'like', $prefix.'%')
                ->orderByDesc('invoice_number')
                ->lockForUpdate()
                ->value('invoice_number');

            $sequence = $last ? (int) substr($last, strlen($prefix)) + 1 : 1;

            return sprintf('%s%05d', $prefix, $sequence);
        });
    }

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
