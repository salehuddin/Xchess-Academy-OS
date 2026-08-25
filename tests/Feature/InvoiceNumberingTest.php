<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\Package;
use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceNumberingTest extends TestCase
{
    use RefreshDatabase;

    public function test_invoice_number_is_assigned_on_create(): void
    {
        $invoice = Invoice::factory()->create(['month_year' => '2026-08']);

        $this->assertNotEmpty($invoice->invoice_number);
        $this->assertMatchesRegularExpression('/^INV-202608-\d{5}$/', $invoice->invoice_number);
    }

    public function test_invoice_numbers_are_sequential_within_a_month(): void
    {
        $first = Invoice::factory()->create(['month_year' => '2026-08']);
        $second = Invoice::factory()->create(['month_year' => '2026-08']);
        $third = Invoice::factory()->create(['month_year' => '2026-08']);

        $this->assertSame('INV-202608-00001', $first->invoice_number);
        $this->assertSame('INV-202608-00002', $second->invoice_number);
        $this->assertSame('INV-202608-00003', $third->invoice_number);
    }

    public function test_invoice_numbers_restart_per_month(): void
    {
        Invoice::factory()->create(['month_year' => '2026-08']);
        Invoice::factory()->create(['month_year' => '2026-08']);

        $september = Invoice::factory()->create(['month_year' => '2026-09']);

        $this->assertSame('INV-202609-00001', $september->invoice_number);
    }

    public function test_invoice_number_is_unique(): void
    {
        Invoice::factory()->create(['month_year' => '2026-08', 'invoice_number' => 'INV-202608-00001']);

        $this->expectException(\Illuminate\Database\QueryException::class);

        Invoice::factory()->create(['month_year' => '2026-08', 'invoice_number' => 'INV-202608-00001']);
    }

    public function test_generate_monthly_command_assigns_sequential_numbers(): void
    {
        $package = Package::factory()->create(['monthly_fee' => 100]);

        Student::factory()->count(3)->create()->each(function ($student) use ($package) {
            $student->classes()->attach(
                \App\Models\ChessClass::factory()->create(['package_id' => $package->id])->id
            );
        });

        $this->artisan('invoices:generate-monthly')
            ->assertSuccessful()
            ->expectsOutput('Generated 3 draft invoices.');

        $monthYear = now()->format('Y-m');
        $stamp = str_replace('-', '', $monthYear);

        $numbers = Invoice::where('month_year', $monthYear)
            ->orderBy('invoice_number')
            ->pluck('invoice_number');

        $this->assertCount(3, $numbers);
        $this->assertSame("INV-{$stamp}-00001", $numbers[0]);
        $this->assertSame("INV-{$stamp}-00002", $numbers[1]);
        $this->assertSame("INV-{$stamp}-00003", $numbers[2]);
    }

    public function test_rerunning_generate_command_does_not_duplicate_invoices(): void
    {
        $package = Package::factory()->create(['monthly_fee' => 100]);
        $student = Student::factory()->create();
        $student->classes()->attach(
            \App\Models\ChessClass::factory()->create(['package_id' => $package->id])->id
        );

        $this->artisan('invoices:generate-monthly')->assertSuccessful();
        $this->artisan('invoices:generate-monthly')->assertSuccessful();

        $this->assertSame(1, Invoice::where('student_id', $student->id)->count());
    }
}
