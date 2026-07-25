<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Setting;
use App\Models\StudentParent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChipPaymentController extends Controller
{
    /**
     * Initiate a Chip payment checkout session for an invoice.
     */
    public function checkout(string $token, Invoice $invoice): RedirectResponse
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
        $environment = Setting::get('chip_environment', 'sandbox');

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
                        'name' => 'Tuition Fee - Invoice #'.$invoice->id.' ('.$invoice->month_year.')',
                        'price' => $amountInCents,
                        'quantity' => 1,
                    ],
                ],
                'notes' => 'Student: '.$invoice->student?->name,
            ],
            'success_redirect' => $redirectUrl.'?payment=success',
            'failure_redirect' => $redirectUrl.'?payment=failed',
            'cancel_redirect' => $redirectUrl.'?payment=cancelled',
            'reference' => 'INV-'.$invoice->id,
        ];

        try {
            $response = Http::withToken($apiKey)->post($endpoint, $payload);

            if ($response->successful() && ! empty($response->json('checkout_url'))) {
                return redirect()->away($response->json('checkout_url'));
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
        $payload = $request->all();
        Log::info('Chip Webhook Received', $payload);

        $event = $payload['event'] ?? $payload['status'] ?? null;
        $reference = $payload['reference'] ?? null;
        $purchaseId = $payload['id'] ?? null;

        if (! $reference) {
            return response()->json(['message' => 'Missing invoice reference'], 400);
        }

        // Extract Invoice ID from reference (e.g. 'INV-12')
        $invoiceId = str_replace('INV-', '', $reference);
        $invoice = Invoice::query()->find($invoiceId);

        if (! $invoice) {
            return response()->json(['message' => 'Invoice not found'], 404);
        }

        if (in_array(strtolower((string) $event), ['paid', 'cleared', 'purchase.paid', 'success'])) {
            if ($invoice->status !== 'Paid') {
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

                activity()
                    ->on($invoice)
                    ->log('Invoice #'.$invoice->id.' marked Paid via Chip Webhook notification');
            }

            return response()->json(['message' => 'Invoice payment reconciled successfully']);
        }

        return response()->json(['message' => 'Webhook received']);
    }
}
