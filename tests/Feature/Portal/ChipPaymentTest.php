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

    private const WEBHOOK_SECRET = 'test-webhook-secret';

    private function signedWebhookHeaders(array $payload, ?string $secret = self::WEBHOOK_SECRET, ?string $override = null): array
    {
        if ($secret === null) {
            return [];
        }

        $body = json_encode($payload);
        $signature = $override ?? hash_hmac('sha256', $body, $secret);

        return ['Signature' => $signature];
    }

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
            'https://gate.chip-in.asia/api/v1/purchases/' => Http::response([
                'id' => 'CHIP_PURCHASE_123',
                'checkout_url' => 'https://gate.chip-in.asia/checkout/123',
            ], 200),
        ]);

        $parent = StudentParent::factory()->create();
        $student = Student::factory()->create(['parent_id' => $parent->id]);
        $invoice = Invoice::factory()->create(['student_id' => $student->id, 'status' => 'Pending', 'total_amount' => 150.00]);

        $response = $this->post(route('portal.invoice.checkout', [$parent->unique_access_token, $invoice->id]));

        $response->assertRedirect('https://gate.chip-in.asia/checkout/123');
    }

    public function test_inertia_checkout_returns_external_location_response(): void
    {
        Setting::set('chip_brand_id', 'TEST_BRAND_ID', 'chip');
        Setting::set('chip_api_key', 'TEST_API_KEY', 'chip');
        Setting::set('chip_environment', 'sandbox', 'chip');

        Http::fake([
            'https://gate.chip-in.asia/api/v1/purchases/' => Http::response([
                'id' => 'CHIP_PURCHASE_123',
                'checkout_url' => 'https://gate.chip-in.asia/checkout/123',
            ], 200),
        ]);

        $parent = StudentParent::factory()->create();
        $student = Student::factory()->create(['parent_id' => $parent->id]);
        $invoice = Invoice::factory()->create(['student_id' => $student->id, 'status' => 'Pending']);

        // Inertia submits the pay button via XHR with the X-Inertia header.
        $response = $this->post(
            route('portal.invoice.checkout', [$parent->unique_access_token, $invoice->id]),
            [],
            ['X-Inertia' => 'true']
        );

        $response->assertStatus(409);
        $response->assertHeader('X-Inertia-Location', 'https://gate.chip-in.asia/checkout/123');
    }

    public function test_chip_webhook_reconciles_invoice_payment(): void
    {
        Setting::set('chip_webhook_secret', self::WEBHOOK_SECRET, 'chip');

        $invoice = Invoice::factory()->create(['status' => 'Pending', 'total_amount' => 200.00]);

        $webhookData = [
            'event' => 'purchase.paid',
            'id' => 'CHIP_TX_9999',
            'reference' => $invoice->invoice_number,
            'status' => 'paid',
        ];

        $response = $this->postJson(
            route('webhooks.chip'),
            $webhookData,
            $this->signedWebhookHeaders($webhookData)
        );

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

    public function test_chip_webhook_is_idempotent_for_duplicate_events(): void
    {
        Setting::set('chip_webhook_secret', self::WEBHOOK_SECRET, 'chip');

        $invoice = Invoice::factory()->create(['status' => 'Pending', 'total_amount' => 200.00]);

        $webhookData = [
            'event' => 'purchase.paid',
            'id' => 'CHIP_TX_9999',
            'reference' => $invoice->invoice_number,
            'status' => 'paid',
        ];

        $this->postJson(route('webhooks.chip'), $webhookData, $this->signedWebhookHeaders($webhookData));
        $response = $this->postJson(route('webhooks.chip'), $webhookData, $this->signedWebhookHeaders($webhookData));

        $response->assertStatus(200);

        $this->assertDatabaseCount('payments', 1);
    }

    public function test_chip_webhook_resolves_legacy_reference_format(): void
    {
        Setting::set('chip_webhook_secret', self::WEBHOOK_SECRET, 'chip');

        $invoice = Invoice::factory()->create(['status' => 'Pending', 'total_amount' => 100.00]);

        // Purchases created before structured numbering used the INV-{id} reference.
        $webhookData = [
            'event' => 'purchase.paid',
            'id' => 'CHIP_TX_LEGACY',
            'reference' => 'INV-'.$invoice->id,
        ];

        $response = $this->postJson(
            route('webhooks.chip'),
            $webhookData,
            $this->signedWebhookHeaders($webhookData)
        );

        $response->assertStatus(200);
        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'status' => 'Paid',
        ]);
    }

    public function test_chip_webhook_rejects_forged_signature(): void
    {
        Setting::set('chip_webhook_secret', self::WEBHOOK_SECRET, 'chip');

        $invoice = Invoice::factory()->create(['status' => 'Pending']);

        $webhookData = [
            'event' => 'purchase.paid',
            'id' => 'CHIP_TX_FORGED',
            'reference' => $invoice->invoice_number,
        ];

        $response = $this->postJson(
            route('webhooks.chip'),
            $webhookData,
            $this->signedWebhookHeaders($webhookData, self::WEBHOOK_SECRET, 'forged-signature')
        );

        $response->assertStatus(401);

        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'status' => 'Pending',
        ]);
        $this->assertDatabaseCount('payments', 0);
    }

    public function test_chip_webhook_rejects_missing_signature(): void
    {
        Setting::set('chip_webhook_secret', self::WEBHOOK_SECRET, 'chip');

        $invoice = Invoice::factory()->create(['status' => 'Pending']);

        $webhookData = [
            'event' => 'purchase.paid',
            'id' => 'CHIP_TX_UNSIGNED',
            'reference' => $invoice->invoice_number,
        ];

        $response = $this->postJson(route('webhooks.chip'), $webhookData);

        $response->assertStatus(401);
        $this->assertDatabaseCount('payments', 0);
    }

    public function test_chip_webhook_rejects_when_secret_unconfigured(): void
    {
        $invoice = Invoice::factory()->create(['status' => 'Pending']);

        $webhookData = [
            'event' => 'purchase.paid',
            'id' => 'CHIP_TX_1',
            'reference' => $invoice->invoice_number,
        ];

        $response = $this->postJson(route('webhooks.chip'), $webhookData);

        $response->assertStatus(503);
        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'status' => 'Pending',
        ]);
        $this->assertDatabaseCount('payments', 0);
    }

    public function test_chip_webhook_ignores_non_paid_events(): void
    {
        Setting::set('chip_webhook_secret', self::WEBHOOK_SECRET, 'chip');

        $invoice = Invoice::factory()->create(['status' => 'Pending']);

        $webhookData = [
            'event' => 'purchase.created',
            'id' => 'CHIP_TX_2',
            'reference' => $invoice->invoice_number,
        ];

        $response = $this->postJson(
            route('webhooks.chip'),
            $webhookData,
            $this->signedWebhookHeaders($webhookData)
        );

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Webhook received']);

        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'status' => 'Pending',
        ]);
        $this->assertDatabaseCount('payments', 0);
    }

    public function test_chip_webhook_rejects_malformed_reference(): void
    {
        Setting::set('chip_webhook_secret', self::WEBHOOK_SECRET, 'chip');

        $webhookData = [
            'event' => 'purchase.paid',
            'id' => 'CHIP_TX_3',
            'reference' => 'INV-not-a-number',
        ];

        $response = $this->postJson(
            route('webhooks.chip'),
            $webhookData,
            $this->signedWebhookHeaders($webhookData)
        );

        $response->assertStatus(404);
        $this->assertDatabaseCount('payments', 0);
    }
}
