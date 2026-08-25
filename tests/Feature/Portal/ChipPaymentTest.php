<?php

namespace Tests\Feature\Portal;

use App\Models\Invoice;
use App\Models\Setting;
use App\Models\Student;
use App\Models\StudentParent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ChipPaymentTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Fixed RSA keypair for test signing. Generation needs openssl.cnf (not
     * reliably found across CI environments), so the pair is embedded; only
     * openssl_sign/openssl_verify run in tests, which need no config.
     */
    private const PRIVATE_PEM = <<<'KEY'
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD2CDog/scJTDfa
HtuB03cXTF4CQKxdCtFwWhnOHJaOxpSL8lV47WNqajMnjxtqaI9fMmst+jlBvTyn
QCCj1Xix8njdpRw9Urw3uKrnSpftQhezG2LYKP4x9wNmmcz5WaeSia//ClNYL155
qanm749tFhO4tSktDTAp6meE76rrgnKICUgDkC+npVgxb125MMQC0sOjItX2QkTz
k0/cMeStPZEA07kpB0h1x9Q9D4AFftNLEVzpf9sZFFX25CCQaPQB307fwGdlPTy2
xjAA0hiEVejE8mFDTQ9MoYtgp2F08THDtxqK5cHqIP2yAUM9Nym7gGiFuY70yy1d
mdD7s5ThAgMBAAECggEABL/3aVQp4QzS5jfiyoCb47wCc54uhbRUA0yGA4PrRzHf
w8znqAhDO1Z2Ct05LQZ8QBz/0zkpulJuNZdoGemg5SSWf0b1At0SS6wZxpHa2YaF
YRyV/bDa6XmInAY7nhPER7C3UF/xaHovo38qS85TsUo0EsSSmS9QPvrqyTb8UIQg
Q0hIX2itagZfTNVAL+zqqNnq59YWPz3HeUnebntZqg1IflPAlKzxWuAr3OGCwInX
E2sJkVFHGNOyFhGwap98IhLBEr5mvgGBNHWo/i9Q2W908CbHarZO4agiUPz/lpr8
GdGSYF1tPQFCde2BgmCVokNa2Mzsgj0GCZDx0tsRQQKBgQD/iQy41LnLWdFU8KwI
N56SA6dfpCNCv+AmPpSmfaoMtHSwp7zTy4VlNrcKEGwVBV/dXyL1D3Hdc2kRSlhN
1oTaeWxWf8CpFxn2gqLada9WAmd+sHidmmRE1vWHcr+3N7LsQQl6uChWS9IgoMyD
ND8FHauLvLpvkxS5pjZr2cyqcQKBgQD2esDw+LQh5flg1yK6r9VaJ+x2z+g9To58
+tS8A5N/rIQs9XEnitMrD2lC9KsuSoJ8ENV4n8OM030NlhUOtHKxEUxybpJvxM5N
i5+GVjbVk7mhpg9S9oIwl/bIRHBs9lyhTr7IdD2GpLuFxhjkRqlVKAa3BNT5nTEP
Sombf7RpcQKBgH9EQpHLYL1mfltPgl6VVORj7Xg0x1r3NSvW/zHsZETvmy5gXCsf
sdA27/KTO0E87AHU4BQtHQit8iYqYNBjhsdIsixidBHC76tWZMVo12p+yAzQ10Gn
I0klxiMvg0w88V+5BH+aOHzCRmT5sOGno7toi4eM902aczgDEBem4cgBAoGBAMvW
ku/2TkpmfYmYAdGwjtpDgCx2HpNs/yve6MYgkwAYdSsVRKI2DhNjaGMGIvdiiWz/
Ivvh7H/ve1EcGIgTtXI4YyeTyCkE8rRwztnzPN/+jptf0PaEhQCY/G99IhkK2WpR
zDfM4gETBT5JqNZIlcumEX+UUGmqlSMXOpxNza8RAoGAGmR/5/LuSLjNl237DURo
DndU48C0NcGFuDLgQ480Bl+veNe6xpxQXA7nfcmNPbGae+hQFapbv2kremTabmbf
wKKzll3O0e7EWLqOyYbtJku5NUdRzPSeTieUuNKVw+ik9v4BPPco1dXWIIpwzC9p
jGpqbeKMhubkGum/z+UG7LE=
-----END PRIVATE KEY-----
KEY;

    private const PUBLIC_PEM = <<<'KEY'
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA9gg6IP7HCUw32h7bgdN3
F0xeAkCsXQrRcFoZzhyWjsaUi/JVeO1jamozJ48bamiPXzJrLfo5Qb08p0Ago9V4
sfJ43aUcPVK8N7iq50qX7UIXsxti2Cj+MfcDZpnM+Vmnkomv/wpTWC9eeamp5u+P
bRYTuLUpLQ0wKepnhO+q64JyiAlIA5Avp6VYMW9duTDEAtLDoyLV9kJE85NP3DHk
rT2RANO5KQdIdcfUPQ+ABX7TSxFc6X/bGRRV9uQgkGj0Ad9O38BnZT08tsYwANIY
hFXoxPJhQ00PTKGLYKdhdPExw7caiuXB6iD9sgFDPTcpu4BohbmO9MstXZnQ+7OU
4QIDAQAB
-----END PUBLIC KEY-----
KEY;

    private function keyPair(): array
    {
        return ['private' => self::PRIVATE_PEM, 'public' => self::PUBLIC_PEM];
    }

    protected function setUp(): void
    {
        parent::setUp();

        // Public keys are cached between deliveries; flush so tests don't
        // see stale keys from sibling tests.
        Cache::flush();
    }

    /**
     * Sign the JSON body the way Chip does: base64 RSA PKCS#1 v1.5 over the
     * SHA256 digest, sent in the X-Signature header.
     */
    private function signedHeaders(array $payload, ?string $privatePem = null): array
    {
        $body = json_encode($payload);
        $privatePem ??= $this->keyPair()['private'];

        openssl_sign($body, $signature, openssl_pkey_get_private($privatePem), OPENSSL_ALGO_SHA256);

        return ['X-Signature' => base64_encode($signature)];
    }

    private function configureExplicitPublicKey(): void
    {
        Setting::set('chip_webhook_public_key', $this->keyPair()['public'], 'chip');
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
        $this->configureExplicitPublicKey();

        $invoice = Invoice::factory()->create(['status' => 'Pending', 'total_amount' => 200.00]);

        $webhookData = [
            'event' => 'purchase.paid',
            'id' => 'CHIP_TX_9999',
            'reference' => $invoice->invoice_number,
            'status' => 'paid',
        ];

        $response = $this->postJson(route('webhooks.chip'), $webhookData, $this->signedHeaders($webhookData));

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

    public function test_chip_webhook_auto_fetches_public_key_from_api(): void
    {
        Setting::set('chip_api_key', 'TEST_API_KEY', 'chip');

        Http::fake([
            'https://gate.chip-in.asia/api/v1/webhooks/' => Http::response([
                'results' => [
                    [
                        'id' => 'wh-1',
                        'public_key' => $this->keyPair()['public'],
                        'callback' => 'https://os.xchessacademy.com/webhooks/chip',
                        'events' => ['purchase.paid'],
                    ],
                ],
                'next' => null,
                'previous' => null,
            ], 200),
        ]);

        $invoice = Invoice::factory()->create(['status' => 'Pending', 'total_amount' => 200.00]);

        $webhookData = [
            'event' => 'purchase.paid',
            'id' => 'CHIP_TX_AUTO',
            'reference' => $invoice->invoice_number,
            'status' => 'paid',
        ];

        $response = $this->postJson(route('webhooks.chip'), $webhookData, $this->signedHeaders($webhookData));

        $response->assertStatus(200);
        $this->assertDatabaseHas('invoices', ['id' => $invoice->id, 'status' => 'Paid']);
    }

    public function test_chip_webhook_is_idempotent_for_duplicate_events(): void
    {
        $this->configureExplicitPublicKey();

        $invoice = Invoice::factory()->create(['status' => 'Pending', 'total_amount' => 200.00]);

        $webhookData = [
            'event' => 'purchase.paid',
            'id' => 'CHIP_TX_9999',
            'reference' => $invoice->invoice_number,
            'status' => 'paid',
        ];

        $this->postJson(route('webhooks.chip'), $webhookData, $this->signedHeaders($webhookData));
        $response = $this->postJson(route('webhooks.chip'), $webhookData, $this->signedHeaders($webhookData));

        $response->assertStatus(200);

        $this->assertDatabaseCount('payments', 1);
    }

    public function test_chip_webhook_resolves_legacy_reference_format(): void
    {
        $this->configureExplicitPublicKey();

        $invoice = Invoice::factory()->create(['status' => 'Pending', 'total_amount' => 100.00]);

        // Purchases created before structured numbering used the INV-{id} reference.
        $webhookData = [
            'event' => 'purchase.paid',
            'id' => 'CHIP_TX_LEGACY',
            'reference' => 'INV-'.$invoice->id,
        ];

        $response = $this->postJson(route('webhooks.chip'), $webhookData, $this->signedHeaders($webhookData));

        $response->assertStatus(200);
        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'status' => 'Paid',
        ]);
    }

    public function test_chip_webhook_rejects_forged_signature(): void
    {
        $this->configureExplicitPublicKey();

        $invoice = Invoice::factory()->create(['status' => 'Pending']);

        $webhookData = [
            'event' => 'purchase.paid',
            'id' => 'CHIP_TX_FORGED',
            'reference' => $invoice->invoice_number,
        ];

        $response = $this->postJson(
            route('webhooks.chip'),
            $webhookData,
            ['X-Signature' => base64_encode(random_bytes(256))]
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
        $this->configureExplicitPublicKey();

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

    public function test_chip_webhook_rejects_when_public_key_unconfigured(): void
    {
        // No explicit public key and no API key to fetch one.
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

    public function test_chip_webhook_rejects_when_no_webhooks_registered(): void
    {
        Setting::set('chip_api_key', 'TEST_API_KEY', 'chip');

        Http::fake([
            'https://gate.chip-in.asia/api/v1/webhooks/' => Http::response(['results' => [], 'next' => null, 'previous' => null], 200),
        ]);

        $invoice = Invoice::factory()->create(['status' => 'Pending']);

        $webhookData = [
            'event' => 'purchase.paid',
            'id' => 'CHIP_TX_NONE',
            'reference' => $invoice->invoice_number,
        ];

        $response = $this->postJson(route('webhooks.chip'), $webhookData, $this->signedHeaders($webhookData));

        $response->assertStatus(503);
        $this->assertDatabaseCount('payments', 0);
    }

    public function test_chip_webhook_ignores_non_paid_events(): void
    {
        $this->configureExplicitPublicKey();

        $invoice = Invoice::factory()->create(['status' => 'Pending']);

        $webhookData = [
            'event' => 'purchase.created',
            'id' => 'CHIP_TX_2',
            'reference' => $invoice->invoice_number,
        ];

        $response = $this->postJson(route('webhooks.chip'), $webhookData, $this->signedHeaders($webhookData));

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
        $this->configureExplicitPublicKey();

        $webhookData = [
            'event' => 'purchase.paid',
            'id' => 'CHIP_TX_3',
            'reference' => 'INV-not-a-number',
        ];

        $response = $this->postJson(route('webhooks.chip'), $webhookData, $this->signedHeaders($webhookData));

        $response->assertStatus(404);
        $this->assertDatabaseCount('payments', 0);
    }
}
