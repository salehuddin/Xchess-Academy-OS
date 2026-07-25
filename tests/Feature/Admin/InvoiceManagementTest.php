<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Mail\InvoiceCreated;
use App\Models\ChessClass;
use App\Models\Invoice;
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
        $invoice = Invoice::factory()->create([
            'base_amount' => 100,
            'tax_amount' => 0,
            'recurring_discount_val' => 0,
            'manual_adjustment' => 0,
            'total_amount' => 100,
        ]);

        $response = $this->actingAs($admin)->put(route('admin.invoices.update', $invoice), [
            'manual_adjustment' => 20,
            'finance_remarks' => 'Missed class',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'manual_adjustment' => 20,
            'total_amount' => 80, // 100 - 20
            'finance_remarks' => 'Missed class',
        ]);
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
