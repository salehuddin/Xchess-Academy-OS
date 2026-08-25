<?php

namespace App\Console\Commands;

use App\Models\Invoice;
use App\Models\InvoiceAdjustment;
use App\Models\Student;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class GenerateMonthlyInvoices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'invoices:generate-monthly';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate draft invoices for all active students for the current month';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $monthYear = now()->format('Y-m');
        $this->info("Generating invoices for {$monthYear}...");

        $students = Student::with(['classes.package'])->get();

        // One query instead of a per-student EXISTS lookup — the batch
        // grows by 1000+ rows each month.
        $existingStudentIds = Invoice::query()
            ->where('month_year', $monthYear)
            ->pluck('student_id')
            ->flip();

        $count = 0;
        foreach ($students as $student) {
            // Check if invoice already exists for this month
            if ($existingStudentIds->has($student->id)) {
                $this->warn("Invoice for student {$student->name} already exists for {$monthYear}. Skipping.");

                continue;
            }

            $baseAmount = $student->classes->sum(fn ($class) => $class->package->monthly_fee);

            if ($baseAmount <= 0) {
                continue; // Skip if no billable classes
            }

            // Simple fixed discount logic for now
            $recurringDiscount = $student->recurring_discount ?? 0;

            // Ensure total doesn't go negative
            $totalBeforeTax = max(0, $baseAmount - $recurringDiscount);

            // Assuming 0 tax for now, or configurable
            $taxAmount = 0;

            // Carry-forward pending adjustments (refund credits reduce, additional fees raise)
            $pendingAdjustments = InvoiceAdjustment::where('student_id', $student->id)
                ->where('status', 'pending')
                ->get();
            $netPending = $pendingAdjustments->reduce(
                fn (float $carry, InvoiceAdjustment $adj) => $carry + $adj->signedAmount(),
                0.0
            );

            $totalAmount = max(0, $totalBeforeTax + $taxAmount + $netPending);

            $invoice = DB::transaction(function () use ($student, $baseAmount, $taxAmount, $recurringDiscount, $netPending, $totalAmount, $monthYear, $pendingAdjustments) {
                $invoice = Invoice::create([
                    'student_id' => $student->id,
                    'base_amount' => $baseAmount,
                    'tax_amount' => $taxAmount,
                    'recurring_discount_val' => $recurringDiscount,
                    'manual_adjustment' => round($netPending, 2),
                    'total_amount' => round($totalAmount, 2),
                    'status' => 'Draft',
                    'month_year' => $monthYear,
                    'due_date' => now()->addDays(7), // Default due date logic
                ]);

                // Mark carried-forward adjustments as applied so they are never reused.
                foreach ($pendingAdjustments as $pendingAdjustment) {
                    $pendingAdjustment->update([
                        'status' => 'applied',
                        'invoice_id' => $invoice->id,
                    ]);
                }

                return $invoice;
            });

            $count++;
        }

        $this->info("Generated {$count} draft invoices.");
    }
}
