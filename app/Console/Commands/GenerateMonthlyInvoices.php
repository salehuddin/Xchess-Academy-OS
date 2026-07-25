<?php

namespace App\Console\Commands;

use App\Models\Invoice;
use App\Models\Student;
use Illuminate\Console\Command;

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

        $count = 0;
        foreach ($students as $student) {
            // Check if invoice already exists for this month
            if (Invoice::where('student_id', $student->id)->where('month_year', $monthYear)->exists()) {
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

            $totalAmount = $totalBeforeTax + $taxAmount;

            Invoice::create([
                'student_id' => $student->id,
                'base_amount' => $baseAmount,
                'tax_amount' => $taxAmount,
                'recurring_discount_val' => $recurringDiscount,
                'manual_adjustment' => 0,
                'total_amount' => $totalAmount,
                'status' => 'Draft',
                'month_year' => $monthYear,
                'due_date' => now()->addDays(7), // Default due date logic
            ]);

            $count++;
        }

        $this->info("Generated {$count} draft invoices.");
    }
}
