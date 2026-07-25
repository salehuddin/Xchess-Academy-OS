<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Display the external services settings page.
     */
    public function services(): Response
    {
        $settings = [
            // Chip Payment Gateway
            'chip_environment' => Setting::get('chip_environment', 'sandbox'),
            'chip_brand_id' => Setting::get('chip_brand_id', ''),
            'chip_api_key' => Setting::get('chip_api_key', ''),
            'chip_webhook_secret' => Setting::get('chip_webhook_secret', ''),

            // SMTP Mailer
            'mail_host' => Setting::get('mail_host', config('mail.mailers.smtp.host', '127.0.0.1')),
            'mail_port' => Setting::get('mail_port', config('mail.mailers.smtp.port', '2525')),
            'mail_username' => Setting::get('mail_username', ''),
            'mail_password' => Setting::get('mail_password', ''),
            'mail_encryption' => Setting::get('mail_encryption', 'tls'),
            'mail_from_address' => Setting::get('mail_from_address', config('mail.from.address', 'hello@xchess-academy.test')),
            'mail_from_name' => Setting::get('mail_from_name', config('mail.from.name', 'X Chess Academy')),

            // WhatsApp Gateway
            'whatsapp_provider' => Setting::get('whatsapp_provider', 'twilio'),
            'whatsapp_account_sid' => Setting::get('whatsapp_account_sid', ''),
            'whatsapp_auth_token' => Setting::get('whatsapp_auth_token', ''),
            'whatsapp_phone_number' => Setting::get('whatsapp_phone_number', ''),
        ];

        return Inertia::render('Admin/Settings/Services', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update external services settings.
     */
    public function updateServices(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'chip_environment' => 'required|in:sandbox,live',
            'chip_brand_id' => 'nullable|string|max:255',
            'chip_api_key' => 'nullable|string|max:255',
            'chip_webhook_secret' => 'nullable|string|max:255',

            'mail_host' => 'required|string|max:255',
            'mail_port' => 'required|numeric',
            'mail_username' => 'nullable|string|max:255',
            'mail_password' => 'nullable|string|max:255',
            'mail_encryption' => 'nullable|string|in:tls,ssl,none',
            'mail_from_address' => 'required|email|max:255',
            'mail_from_name' => 'required|string|max:255',

            'whatsapp_provider' => 'required|string|in:twilio,waba,ultramsg',
            'whatsapp_account_sid' => 'nullable|string|max:255',
            'whatsapp_auth_token' => 'nullable|string|max:255',
            'whatsapp_phone_number' => 'nullable|string|max:255',
        ]);

        // Save Chip Settings
        Setting::set('chip_environment', $validated['chip_environment'], 'chip');
        Setting::set('chip_brand_id', $validated['chip_brand_id'] ?? '', 'chip');
        Setting::set('chip_api_key', $validated['chip_api_key'] ?? '', 'chip', true);
        Setting::set('chip_webhook_secret', $validated['chip_webhook_secret'] ?? '', 'chip', true);

        // Save SMTP Settings
        Setting::set('mail_host', $validated['mail_host'], 'smtp');
        Setting::set('mail_port', $validated['mail_port'], 'smtp');
        Setting::set('mail_username', $validated['mail_username'] ?? '', 'smtp');
        Setting::set('mail_password', $validated['mail_password'] ?? '', 'smtp', true);
        Setting::set('mail_encryption', $validated['mail_encryption'] ?? 'tls', 'smtp');
        Setting::set('mail_from_address', $validated['mail_from_address'], 'smtp');
        Setting::set('mail_from_name', $validated['mail_from_name'], 'smtp');

        // Save WhatsApp Settings
        Setting::set('whatsapp_provider', $validated['whatsapp_provider'], 'whatsapp');
        Setting::set('whatsapp_account_sid', $validated['whatsapp_account_sid'] ?? '', 'whatsapp');
        Setting::set('whatsapp_auth_token', $validated['whatsapp_auth_token'] ?? '', 'whatsapp', true);
        Setting::set('whatsapp_phone_number', $validated['whatsapp_phone_number'] ?? '', 'whatsapp');

        activity()
            ->causedBy($request->user())
            ->log('Updated External Services Settings (Chip, SMTP, WhatsApp)');

        return back()->with('success', 'External services settings updated successfully.');
    }

    /**
     * Test SMTP Connection.
     */
    public function testSmtp(Request $request): RedirectResponse
    {
        $request->validate(['recipient' => 'required|email']);

        try {
            Mail::raw('This is a test email from X Chess Academy OS settings panel.', function ($message) use ($request) {
                $message->to($request->recipient)
                    ->subject('Test Email - X Chess Academy OS');
            });

            return back()->with('success', 'Test email sent successfully to '.$request->recipient);
        } catch (\Exception $e) {
            return back()->with('error', 'SMTP Test Failed: '.$e->getMessage());
        }
    }

    /**
     * Test Chip Gateway Connection.
     */
    public function testChip(): RedirectResponse
    {
        $brandId = Setting::get('chip_brand_id');
        $apiKey = Setting::get('chip_api_key');

        if (empty($brandId) || empty($apiKey)) {
            return back()->with('error', 'Chip Brand ID and API Key are required to test connection.');
        }

        try {
            $endpoint = Setting::get('chip_environment') === 'live'
                ? 'https://gate.chip-in.asia/api/v1/purchases/'
                : 'https://gate.sandbox.chip-in.asia/api/v1/purchases/';

            $response = Http::withToken($apiKey)->get($endpoint);

            if ($response->successful() || $response->status() === 400 || $response->status() === 422) {
                return back()->with('success', 'Chip API Connection Successful (Status Code: '.$response->status().')');
            }

            return back()->with('error', 'Chip API Test Returned Status Code: '.$response->status());
        } catch (\Exception $e) {
            return back()->with('error', 'Chip Connection Failed: '.$e->getMessage());
        }
    }

    /**
     * Test WhatsApp Gateway Connection.
     */
    public function testWhatsApp(Request $request): RedirectResponse
    {
        $request->validate(['phone' => 'required|string']);

        $provider = Setting::get('whatsapp_provider', 'twilio');
        $authToken = Setting::get('whatsapp_auth_token');

        if (empty($authToken)) {
            return back()->with('error', 'WhatsApp Auth Token / API Key is required.');
        }

        return back()->with('success', 'WhatsApp connection simulation triggered for provider ['.$provider.'] to '.$request->phone);
    }

    /**
     * Display Company Profile settings page.
     */
    public function company(): Response
    {
        $settings = [
            'company_name' => Setting::get('company_name', 'X Chess Academy'),
            'company_reg_no' => Setting::get('company_reg_no', '202401012345 (SSM)'),
            'company_email' => Setting::get('company_email', 'info@xchess-academy.com'),
            'company_phone' => Setting::get('company_phone', '+60 12-345 6789'),
            'company_address' => Setting::get('company_address', "Suite 10-2, Level 10, Chess Tower\nKuala Lumpur, Malaysia"),
            'company_bank_details' => Setting::get('company_bank_details', "Maybank: 5140 1234 5678\nAccount Name: X Chess Academy Sdn Bhd"),
        ];

        return Inertia::render('Admin/Settings/Company', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update Company Profile settings.
     */
    public function updateCompany(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'company_reg_no' => 'nullable|string|max:255',
            'company_email' => 'required|email|max:255',
            'company_phone' => 'required|string|max:255',
            'company_address' => 'required|string',
            'company_bank_details' => 'nullable|string',
        ]);

        Setting::set('company_name', $validated['company_name'], 'company');
        Setting::set('company_reg_no', $validated['company_reg_no'] ?? '', 'company');
        Setting::set('company_email', $validated['company_email'], 'company');
        Setting::set('company_phone', $validated['company_phone'], 'company');
        Setting::set('company_address', $validated['company_address'], 'company');
        Setting::set('company_bank_details', $validated['company_bank_details'] ?? '', 'company');

        activity()
            ->causedBy($request->user())
            ->log('Updated Company / Academy Profile Settings');

        return back()->with('success', 'Company profile settings updated successfully.');
    }
}
