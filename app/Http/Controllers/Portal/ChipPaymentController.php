<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Setting;
use App\Models\StudentParent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
        $environment = Setting::get('chip_environment', config('services.chip.environment', 'sandbox'));

        if (empty($brandId) || empty($apiKey)) {
            return back()->with('error', 'Chip Payment Gateway is currently unconfigured. Please contact academy finance.');
        }

        $endpoint = $environment === 'live'
            ? 'https://gate.chip-in.asia/api/v1/purchases/'
            : 'https://gate.sandbox.chip-in.asia/api/v1/purchases/';

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
        $secret = Setting::get('chip_webhook_secret', config('services.chip.webhook_secret'));

        if (empty($secret)) {
            Log::warning('Chip Webhook rejected: webhook secret is not configured');

            return response()->json(['message' => 'Webhook secret not configured'], 503);
        }

        $signature = $this->signatureFromRequest($request);

        if (! $this->hasValidSignature($request, $signature, $secret)) {
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
     * Chip signs each webhook with the HMAC-SHA256 of the raw request body
     * using the configured webhook secret. Accept the signature from either
     * the `Signature` or `X-Signature` header.
     */
    private function signatureFromRequest(Request $request): ?string
    {
        $signature = $request->header('Signature') ?: $request->header('X-Signature');

        if (! $signature) {
            return null;
        }

        // Tolerate an optional algorithm prefix, e.g. "sha256=<hash>".
        return strtolower(preg_replace('/^sha256=/', '', trim((string) $signature)));
    }

    private function hasValidSignature(Request $request, ?string $signature, string $secret): bool
    {
        if (! $signature) {
            return false;
        }

        $expected = hash_hmac('sha256', $request->getContent(), $secret);

        return hash_equals($expected, $signature);
    }
}
