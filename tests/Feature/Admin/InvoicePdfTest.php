<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Setting;
use App\Models\Student;
use App\Models\StudentParent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoicePdfTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_update_company_profile_settings(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);

        $response = $this->actingAs($admin)->post(route('admin.settings.company.update'), [
            'company_name' => 'Grandmaster Chess Academy',
            'company_reg_no' => '202699988776',
            'company_email' => 'finance@grandmaster.test',
            'company_phone' => '+60 19-888 7766',
            'company_address' => 'Level 50, Tower 1, KLCC',
            'company_bank_details' => 'CIMB: 8881234567',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertEquals('Grandmaster Chess Academy', Setting::get('company_name'));
        $this->assertEquals('202699988776', Setting::get('company_reg_no'));
    }

    public function test_admin_can_download_invoice_pdf(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $parent = StudentParent::factory()->create();
        $student = Student::factory()->create(['parent_id' => $parent->id]);
        $invoice = Invoice::factory()->create(['student_id' => $student->id, 'status' => 'Pending']);

        $response = $this->actingAs($admin)->get(route('admin.invoices.pdf', $invoice->id));

        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');
    }

    public function test_parent_can_download_invoice_pdf_via_token(): void
    {
        $parent = StudentParent::factory()->create(['unique_access_token' => 'test-token-123']);
        $student = Student::factory()->create(['parent_id' => $parent->id]);
        $invoice = Invoice::factory()->create(['student_id' => $student->id, 'status' => 'Pending']);

        $response = $this->get(route('portal.invoice.pdf', ['token' => 'test-token-123', 'invoice' => $invoice->id]));

        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');
    }

    public function test_parent_can_download_receipt_pdf_for_paid_invoice(): void
    {
        $parent = StudentParent::factory()->create(['unique_access_token' => 'test-token-456']);
        $student = Student::factory()->create(['parent_id' => $parent->id]);
        $invoice = Invoice::factory()->create(['student_id' => $student->id, 'status' => 'Paid', 'total_amount' => 150.00]);

        Payment::create([
            'invoice_id' => $invoice->id,
            'amount' => 150.00,
            'payment_date' => now(),
            'payment_method' => 'Chip Gateway',
            'transaction_id' => 'CHIP-TEST-999',
        ]);

        $response = $this->get(route('portal.invoice.receipt-pdf', ['token' => 'test-token-456', 'invoice' => $invoice->id]));

        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');
    }

    public function test_parent_cannot_download_receipt_for_unpaid_invoice(): void
    {
        $parent = StudentParent::factory()->create(['unique_access_token' => 'test-token-789']);
        $student = Student::factory()->create(['parent_id' => $parent->id]);
        $invoice = Invoice::factory()->create(['student_id' => $student->id, 'status' => 'Pending']);

        $response = $this->get(route('portal.invoice.receipt-pdf', ['token' => 'test-token-789', 'invoice' => $invoice->id]));

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }
}
