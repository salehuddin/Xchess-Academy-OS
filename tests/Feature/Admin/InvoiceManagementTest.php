<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Mail\InvoiceCreated;
use App\Models\ChessClass;
use App\Models\Invoice;
use App\Models\InvoiceAdjustment;
use App\Models\Package;
use App\Models\Student;
use App\Models\StudentParent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class InvoiceManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_command_generates_monthly_invoices()
    {
        // Setup
        $package = Package::factory()->create(['monthly_fee' => 100]);
        $class = ChessClass::factory()->create(['package_id' => $package->id]);
        $student = Student::factory()->create(['recurring_discount' => 10]);
        $student->classes()->attach($class);

        // Run command
        $this->artisan('invoices:generate-monthly')
            ->assertExitCode(0);

        // Verify invoice
        $this->assertDatabaseHas('invoices', [
            'student_id' => $student->id,
            'base_amount' => 100,
            'recurring_discount_val' => 10,
            'total_amount' => 90, // 100 - 10 + 0 tax
            'status' => 'Draft',
            'month_year' => now()->format('Y-m'),
        ]);
    }

    public function test_admin_can_view_invoices()
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $invoice = Invoice::factory()->create();

        $response = $this->actingAs($admin)->get(route('admin.invoices.index'));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Invoices/Index')
                ->has('invoices.data', 1)
            );
    }

    public function test_admin_can_update_manual_adjustment()
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $parent = StudentParent::factory()->create(['email' => 'parent@example.com']);
        $student = Student::factory()->create(['parent_id' => $parent->id]);
        $invoice = Invoice::factory()->create([
            'student_id' => $student->id,
            'base_amount' => 100,
            'tax_amount' => 0,
            'recurring_discount_val' => 0,
            'manual_adjustment' => 0,
            'total_amount' => 100,
            'status' => 'Draft',
        ]);

        $response = $this->actingAs($admin)->put(route('admin.invoices.update', $invoice), [
            'finance_remarks' => 'Missed class',
            'adjustments' => [
                ['id' => null, 'type' => 'credit', 'amount' => 20, 'reason' => 'Missed class'],
            ],
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'manual_adjustment' => -20,
            'total_amount' => 80, // 100 - 20
            'finance_remarks' => 'Missed class',
        ]);

        $this->assertDatabaseHas('invoice_adjustments', [
            'invoice_id' => $invoice->id,
            'type' => 'credit',
            'amount' => 20,
            'status' => 'applied',
        ]);
    }

    public function test_admin_can_add_a_charge_adjustment()
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $parent = StudentParent::factory()->create(['email' => 'parent@example.com']);
        $student = Student::factory()->create(['parent_id' => $parent->id]);
        $invoice = Invoice::factory()->create([
            'student_id' => $student->id,
            'base_amount' => 100,
            'tax_amount' => 0,
            'recurring_discount_val' => 0,
            'manual_adjustment' => 0,
            'total_amount' => 100,
            'status' => 'Draft',
        ]);

        $response = $this->actingAs($admin)->put(route('admin.invoices.update', $invoice), [
            'finance_remarks' => null,
            'adjustments' => [
                ['id' => null, 'type' => 'charge', 'amount' => 30, 'reason' => 'Replacement session'],
            ],
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'manual_adjustment' => 30,
            'total_amount' => 130, // 100 + 30
        ]);
    }

    public function test_admin_can_remove_an_adjustment_and_total_updates()
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $parent = StudentParent::factory()->create(['email' => 'parent@example.com']);
        $student = Student::factory()->create(['parent_id' => $parent->id]);
        $invoice = Invoice::factory()->create([
            'student_id' => $student->id,
            'base_amount' => 100,
            'tax_amount' => 0,
            'recurring_discount_val' => 0,
            'manual_adjustment' => 0,
            'total_amount' => 100,
            'status' => 'Draft',
        ]);

        $adjustment = InvoiceAdjustment::create([
            'invoice_id' => $invoice->id,
            'student_id' => $student->id,
            'type' => 'credit',
            'amount' => 20,
            'reason' => 'Missed class',
            'status' => 'applied',
        ]);

        // Submit an empty adjustments set → all removals.
        $this->actingAs($admin)->put(route('admin.invoices.update', $invoice), [
            'finance_remarks' => null,
            'adjustments' => [],
        ])->assertRedirect();

        $this->assertDatabaseMissing('invoice_adjustments', ['id' => $adjustment->id]);
        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'total_amount' => 100, // back to original
        ]);
    }

    public function test_admin_can_add_mixed_credit_and_charge_adjustments()
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $parent = StudentParent::factory()->create(['email' => 'parent@example.com']);
        $student = Student::factory()->create(['parent_id' => $parent->id]);
        $invoice = Invoice::factory()->create([
            'student_id' => $student->id,
            'base_amount' => 100,
            'tax_amount' => 0,
            'recurring_discount_val' => 0,
            'manual_adjustment' => 0,
            'total_amount' => 100,
            'status' => 'Draft',
        ]);

        $response = $this->actingAs($admin)->put(route('admin.invoices.update', $invoice), [
            'finance_remarks' => null,
            'adjustments' => [
                ['id' => null, 'type' => 'credit', 'amount' => 20, 'reason' => 'Missed class'],
                ['id' => null, 'type' => 'charge', 'amount' => 30, 'reason' => 'Replacement session'],
            ],
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'manual_adjustment' => 10, // +30 charge - 20 credit
            'total_amount' => 110,
        ]);
    }

    public function test_adjustments_cannot_be_edited_on_non_draft_invoice()
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $parent = StudentParent::factory()->create(['email' => 'parent@example.com']);
        $student = Student::factory()->create(['parent_id' => $parent->id]);
        $invoice = Invoice::factory()->create([
            'student_id' => $student->id,
            'base_amount' => 100,
            'tax_amount' => 0,
            'recurring_discount_val' => 0,
            'manual_adjustment' => 0,
            'total_amount' => 100,
            'status' => 'Pending',
        ]);

        $this->actingAs($admin)->put(route('admin.invoices.update', $invoice), [
            'finance_remarks' => null,
            'adjustments' => [
                ['id' => null, 'type' => 'credit', 'amount' => 20, 'reason' => 'Missed class'],
            ],
        ])->assertRedirect();

        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'total_amount' => 100, // unchanged
        ]);
    }

    public function test_pending_refund_is_auto_applied_to_next_month_invoice()
    {
        $package = Package::factory()->create(['monthly_fee' => 100]);
        $class = ChessClass::factory()->create(['package_id' => $package->id]);
        $parent = StudentParent::factory()->create(['email' => 'parent@example.com']);
        $student = Student::factory()->create(['parent_id' => $parent->id, 'recurring_discount' => 0]);
        $student->classes()->attach($class);

        InvoiceAdjustment::create([
            'student_id' => $student->id,
            'type' => 'credit',
            'amount' => 25,
            'reason' => 'Refund for cancelled class',
            'status' => 'pending',
        ]);

        $this->artisan('invoices:generate-monthly')->assertExitCode(0);

        $invoice = Invoice::where('student_id', $student->id)->first();

        $this->assertNotNull($invoice);
        $this->assertEquals(75, (float) $invoice->total_amount); // 100 - 25

        // Pending adjustment should be applied exactly once
        $this->assertDatabaseHas('invoice_adjustments', [
            'student_id' => $student->id,
            'status' => 'applied',
            'invoice_id' => $invoice->id,
        ]);
        $this->assertDatabaseMissing('invoice_adjustments', [
            'student_id' => $student->id,
            'status' => 'pending',
        ]);
    }

    public function test_pending_additional_charge_is_auto_applied_to_next_month_invoice()
    {
        $package = Package::factory()->create(['monthly_fee' => 100]);
        $class = ChessClass::factory()->create(['package_id' => $package->id]);
        $parent = StudentParent::factory()->create(['email' => 'parent@example.com']);
        $student = Student::factory()->create(['parent_id' => $parent->id, 'recurring_discount' => 0]);
        $student->classes()->attach($class);

        InvoiceAdjustment::create([
            'student_id' => $student->id,
            'type' => 'charge',
            'amount' => 40,
            'reason' => 'Additional tournament fee',
            'status' => 'pending',
        ]);

        $this->artisan('invoices:generate-monthly')->assertExitCode(0);

        $invoice = Invoice::where('student_id', $student->id)->first();

        $this->assertNotNull($invoice);
        $this->assertEquals(140, (float) $invoice->total_amount); // 100 + 40
    }

    public function test_pending_adjustment_is_applied_only_once_across_generations()
    {
        $package = Package::factory()->create(['monthly_fee' => 100]);
        $class = ChessClass::factory()->create(['package_id' => $package->id]);
        $parent = StudentParent::factory()->create(['email' => 'parent@example.com']);
        $student = Student::factory()->create(['parent_id' => $parent->id, 'recurring_discount' => 0]);
        $student->classes()->attach($class);

        InvoiceAdjustment::create([
            'student_id' => $student->id,
            'type' => 'credit',
            'amount' => 25,
            'reason' => 'Refund',
            'status' => 'pending',
        ]);

        $this->artisan('invoices:generate-monthly')->assertExitCode(0);
        $this->artisan('invoices:generate-monthly')->assertExitCode(0); // second run skips existing

        $invoices = Invoice::where('student_id', $student->id)->get();
        $this->assertCount(1, $invoices);
        $this->assertEquals(75, (float) $invoices->first()->total_amount);
    }

    public function test_admin_can_send_invoice()
    {
        Mail::fake();

        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $parent = StudentParent::factory()->create(['email' => 'parent@example.com']);
        $student = Student::factory()->create(['parent_id' => $parent->id]);
        $invoice = Invoice::factory()->create([
            'student_id' => $student->id,
            'status' => 'Draft',
            'notification_sent' => false,
        ]);

        $response = $this->actingAs($admin)->post(route('admin.invoices.send', $invoice));

        $response->assertRedirect();

        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'status' => 'Pending',
            'notification_sent' => true,
        ]);

        Mail::assertSent(InvoiceCreated::class, function ($mail) use ($parent) {
            return $mail->hasTo($parent->email);
        });
    }
}
