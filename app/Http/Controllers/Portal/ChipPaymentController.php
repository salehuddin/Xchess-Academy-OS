<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Setting;
use App\Models\StudentParent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class ChipPaymentController extends Controller
{
    /**
     * Initiate a Chip payment checkout session for an invoice.
     */
    public function checkout(string $token, Invoice $invoice, Request $request): Response
    {
        $parent = StudentParent::query()
            ->where('unique_access_token', $token)
            ->firstOrFail();

        $invoice->load(['student.parent']);

        if ($invoice->student?->parent_id !== $parent->id) {
            abort(404);
        }

        if ($invoice->status === 'Paid') {
            return back()->with('success', 'This invoice has already been paid in full.');
        }

        $brandId = Setting::get('chip_brand_id', config('services.chip.brand_id'));
        $apiKey = Setting::get('chip_api_key', config('services.chip.api_key'));

        if (empty($brandId) || empty($apiKey)) {
            return back()->with('error', 'Chip Payment Gateway is currently unconfigured. Please contact academy finance.');
        }

        // Chip uses a single API host for test and live; the API key determines
        // which mode is used. There is no separate sandbox subdomain.
        $endpoint = config('services.chip.base_url').'/purchases/';

        $amountInCents = (int) round($invoice->total_amount * 100);
        $redirectUrl = route('portal.invoice.show', [$token, $invoice->id]);

        $payload = [
            'brand_id' => $brandId,
            'client' => [
                'email' => $parent->email ?? 'parent@xchess-academy.test',
                'phone' => $parent->phone ?? '+60123456789',
                'full_name' => $parent->name,
            ],
            'purchase' => [
                'currency' => 'MYR',
                'products' => [
                    [
                        'name' => 'Tuition Fee - '.$invoice->invoice_number.' ('.$invoice->month_year.')',
                        'price' => $amountInCents,
                        'quantity' => 1,
                    ],
                ],
                'notes' => 'Student: '.$invoice->student?->name,
            ],
            'success_redirect' => $redirectUrl.'?payment=success',
            'failure_redirect' => $redirectUrl.'?payment=failed',
            'cancel_redirect' => $redirectUrl.'?payment=cancelled',
            'reference' => $invoice->invoice_number,
        ];

        try {
            $response = Http::withToken($apiKey)->post($endpoint, $payload);

            if ($response->successful() && ! empty($response->json('checkout_url'))) {
                $checkoutUrl = $response->json('checkout_url');

                // Inertia XHR requests cannot follow a plain 302 to an external
                // domain (the redirect is followed inside XHR and blocked by
                // CORS). Return a 409 + X-Inertia-Location response so the
                // client performs a full page navigation to Chip's checkout.
                if ($request->header('X-Inertia')) {
                    return Inertia::location($checkoutUrl);
                }

                return redirect()->away($checkoutUrl);
            }

            Log::error('Chip Checkout Error', ['response' => $response->json(), 'status' => $response->status()]);

            return back()->with('error', 'Unable to initiate Chip payment checkout session: '.($response->json('message') ?? 'API Error'));
        } catch (\Exception $e) {
            Log::error('Chip Checkout Exception: '.$e->getMessage());

            return back()->with('error', 'Payment service error: '.$e->getMessage());
        }
    }

    /**
     * Handle incoming webhook notifications from Chip Payment Gateway.
     */
    public function webhook(Request $request): JsonResponse
    {
        // Chip signs every webhook with an RSA PKCS#1 v1.5 signature of the
        // SHA256 digest of the raw request body, sent in the X-Signature
        // header. The public key lives on the Webhook object, fetched via the
        // Chip API. An explicit public key may be configured to skip the fetch.
        $publicKeys = $this->webhookPublicKeys();

        if (empty($publicKeys)) {
            Log::warning('Chip Webhook rejected: no webhook public key configured or fetchable');

            return response()->json(['message' => 'Webhook public key not configured'], 503);
        }

        $signature = $request->header('X-Signature');

        if (! $signature || ! $this->signatureIsValid($request->getContent(), $signature, $publicKeys)) {
            Log::warning('Chip Webhook rejected: invalid or missing signature', [
                'ip' => $request->ip(),
                'reference' => $request->input('reference'),
            ]);

            return response()->json(['message' => 'Invalid signature'], 401);
        }

        $payload = $request->all();
        Log::info('Chip Webhook Received', $payload);

        $event = $payload['event'] ?? $payload['status'] ?? null;
        $reference = $payload['reference'] ?? null;
        $purchaseId = $payload['id'] ?? null;

        if (! $reference) {
            return response()->json(['message' => 'Missing invoice reference'], 400);
        }

        // Resolve the invoice from the purchase reference. Current format is
        // the structured invoice number (INV-YYYYMM-#####); purchases created
        // before that used the legacy INV-{id} reference.
        $invoice = $this->resolveInvoiceFromReference((string) $reference);

        if (! $invoice) {
            return response()->json(['message' => 'Invoice not found'], 404);
        }

        if (in_array(strtolower((string) $event), ['paid', 'cleared', 'purchase.paid', 'success'])) {
            // Idempotency: skip if the invoice is already reconciled or this
            // Chip purchase has already been recorded.
            $alreadyReconciled = $invoice->status === 'Paid'
                || ($purchaseId && Payment::query()->where('transaction_id', $purchaseId)->exists());

            if (! $alreadyReconciled) {
                DB::transaction(function () use ($invoice, $purchaseId) {
                    $invoice->update([
                        'status' => 'Paid',
                    ]);

                    Payment::query()->create([
                        'invoice_id' => $invoice->id,
                        'amount' => $invoice->total_amount,
                        'payment_date' => now()->toDateString(),
                        'payment_method' => 'Chip Gateway',
                        'transaction_id' => $purchaseId ?? 'CHIP-'.now()->timestamp,
                        'notes' => 'Automated payment reconciliation via Chip webhook',
                    ]);
                });

                activity()
                    ->on($invoice)
                    ->log($invoice->invoice_number.' marked Paid via Chip Webhook notification');
            }

            return response()->json(['message' => 'Invoice payment reconciled successfully']);
        }

        return response()->json(['message' => 'Webhook received']);
    }

    /**
     * Resolve an invoice from a Chip purchase reference. Supports the
     * structured invoice number (INV-YYYYMM-#####) and the legacy
     * INV-{id} format used before structured numbering was introduced.
     */
    private function resolveInvoiceFromReference(string $reference): ?Invoice
    {
        if (preg_match('/^INV-\d{6}-\d{1,6}$/', $reference)) {
            return Invoice::query()->where('invoice_number', $reference)->first();
        }

        if (preg_match('/^INV-(\d+)$/', $reference, $matches)) {
            return Invoice::query()->find((int) $matches[1]);
        }

        return null;
    }

    /**
     * Resolve the candidate public keys for verifying a webhook payload.
     *
     * Priority:
     *  1. An explicitly configured PEM (`chip_webhook_public_key` setting or
     *     `services.chip.webhook_public_key`) — useful for locked-down setups.
     *  2. The `public_key` of each registered Webhook, fetched via the Chip
     *     API and cached for a day to avoid outbound calls on every delivery.
     *
     * Returns an empty array when neither is available (caller should 503).
     *
     * @return string[]
     */
    private function webhookPublicKeys(): array
    {
        $explicit = Setting::get('chip_webhook_public_key', config('services.chip.webhook_public_key'));

        if (! empty($explicit)) {
            return [trim($explicit)];
        }

        $apiKey = Setting::get('chip_api_key', config('services.chip.api_key'));

        if (empty($apiKey)) {
            return [];
        }

        return Cache::remember('chip:webhook_public_keys', now()->addDay(), function () use ($apiKey) {
            try {
                $response = Http::withToken($apiKey)
                    ->get(config('services.chip.base_url').'/webhooks/');

                if (! $response->successful()) {
                    Log::warning('Chip webhook public key fetch failed', ['status' => $response->status()]);

                    return [];
                }

                // GET /webhooks/ returns a paginated {results: [...]} object.
                $keys = [];
                foreach ($response->json('results', []) as $webhook) {
                    if (! empty($webhook['public_key'])) {
                        $keys[] = trim($webhook['public_key']);
                    }
                }

                return array_values(array_unique($keys));
            } catch (\Exception $e) {
                Log::error('Chip webhook public key fetch exception: '.$e->getMessage());

                return [];
            }
        });
    }

    /**
     * Verify a Chip webhook signature (base64 RSA PKCS#1 v1.5 over the
     * SHA256 digest of the raw body) against any of the candidate keys.
     */
    private function signatureIsValid(string $body, string $signatureB64, array $publicKeys): bool
    {
        $signature = base64_decode($signatureB64, true);

        if ($signature === false) {
            return false;
        }

        foreach ($publicKeys as $pem) {
            $key = openssl_pkey_get_public($pem);

            if ($key === false) {
                continue;
            }

            if (openssl_verify($body, $signature, $key, OPENSSL_ALGO_SHA256) === 1) {
                return true;
            }
        }

        return false;
    }
}
