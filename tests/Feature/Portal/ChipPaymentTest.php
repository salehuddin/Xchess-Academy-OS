<?php

namespace Tests\Feature\Portal;

use App\Models\Invoice;
use App\Models\Setting;
use App\Models\Student;
use App\Models\StudentParent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ChipPaymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_parent_cannot_checkout_unconfigured_chip(): void
    {
        $parent = StudentParent::factory()->create();
        $student = Student::factory()->create(['parent_id' => $parent->id]);
        $invoice = Invoice::factory()->create(['student_id' => $student->id, 'status' => 'Pending']);

        $response = $this->post(route('portal.invoice.checkout', [$parent->unique_access_token, $invoice->id]));

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }

    public function test_parent_checkout_redirects_to_chip_checkout_url(): void
    {
        Setting::set('chip_brand_id', 'TEST_BRAND_ID', 'chip');
        Setting::set('chip_api_key', 'TEST_API_KEY', 'chip');
        Setting::set('chip_environment', 'sandbox', 'chip');

        Http::fake([
            'https://gate.sandbox.chip-in.asia/api/v1/purchases/' => Http::response([
                'id' => 'CHIP_PURCHASE_123',
                'checkout_url' => 'https://gate.sandbox.chip-in.asia/checkout/123',
            ], 200),
        ]);

        $parent = StudentParent::factory()->create();
        $student = Student::factory()->create(['parent_id' => $parent->id]);
        $invoice = Invoice::factory()->create(['student_id' => $student->id, 'status' => 'Pending', 'total_amount' => 150.00]);

        $response = $this->post(route('portal.invoice.checkout', [$parent->unique_access_token, $invoice->id]));

        $response->assertRedirect('https://gate.sandbox.chip-in.asia/checkout/123');
    }

    public function test_chip_webhook_reconciles_invoice_payment(): void
    {
        $invoice = Invoice::factory()->create(['status' => 'Pending', 'total_amount' => 200.00]);

        $webhookData = [
            'event' => 'purchase.paid',
            'id' => 'CHIP_TX_9999',
            'reference' => 'INV-'.$invoice->id,
            'status' => 'paid',
        ];

        $response = $this->postJson(route('webhooks.chip'), $webhookData);

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Invoice payment reconciled successfully']);

        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'status' => 'Paid',
        ]);

        $this->assertDatabaseHas('payments', [
            'invoice_id' => $invoice->id,
            'amount' => 200.00,
            'payment_method' => 'Chip Gateway',
            'transaction_id' => 'CHIP_TX_9999',
        ]);
    }
}
