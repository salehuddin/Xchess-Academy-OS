<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\MailConfig;
use App\Services\Notifications\Channels\WhatsAppChannel;
use App\Services\WhatsAppConfig;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function index(): Response
    {
        $settings = [
            'company_name' => Setting::get('company_name', 'X Chess Academy'),
            'company_reg_no' => Setting::get('company_reg_no', '202401012345 (SSM)'),
            'company_email' => Setting::get('company_email', 'info@xchess-academy.com'),
            'company_phone' => Setting::get('company_phone', '+60 12-345 6789'),
            'company_address' => Setting::get('company_address', "Suite 10-2, Level 10, Chess Tower\nKuala Lumpur, Malaysia"),
            'company_bank_details' => Setting::get('company_bank_details', "Maybank: 5140 1234 5678\nAccount Name: X Chess Academy Sdn Bhd"),
            'company_website' => Setting::get('company_website', 'https://xchessacademy.com'),
            'company_logo' => Setting::get('company_logo'),

            'support_email' => Setting::get('support_email', 'support@xchess-academy.com'),
            'support_phone' => Setting::get('support_phone', '+60 12-345 6789'),
            'support_hours' => Setting::get('support_hours', 'Mon-Fri, 9am - 6pm'),

            'chip_environment' => Setting::get('chip_environment', 'sandbox'),
            'chip_brand_id' => Setting::get('chip_brand_id', ''),
            'chip_api_key' => Setting::get('chip_api_key', ''),
            'chip_webhook_public_key' => Setting::get('chip_webhook_public_key', ''),

            'mail_host' => Setting::get('mail_host', config('mail.mailers.smtp.host', '127.0.0.1')),
            'mail_port' => Setting::get('mail_port', config('mail.mailers.smtp.port', '2525')),
            'mail_username' => Setting::get('mail_username', ''),
            'mail_password' => Setting::get('mail_password', ''),
            'mail_encryption' => Setting::get('mail_encryption', 'tls'),
            'mail_from_address' => Setting::get('mail_from_address', config('mail.from.address', 'hello@xchess-academy.test')),
            'mail_from_name' => Setting::get('mail_from_name', config('mail.from.name', 'X Chess Academy')),

            'whatsapp_provider' => Setting::get('whatsapp_provider', 'twilio'),
            'whatsapp_account_sid' => Setting::get('whatsapp_account_sid', ''),
            'whatsapp_auth_token' => Setting::get('whatsapp_auth_token', ''),
            'whatsapp_phone_number' => Setting::get('whatsapp_phone_number', ''),
            'whatsapp_access_token' => Setting::get('whatsapp_access_token', ''),
            'whatsapp_phone_number_id' => Setting::get('whatsapp_phone_number_id', ''),

            'notifications_enabled' => Setting::get('notifications_enabled', true),
            'notifications_daily_limit' => Setting::get('notifications_daily_limit', 250),
            'notifications_retry_attempts' => Setting::get('notifications_retry_attempts', 3),
            'notifications_retry_delay_minutes' => Setting::get('notifications_retry_delay_minutes', 30),
            'notifications_admin_alert_email' => Setting::get('notifications_admin_alert_email', ''),
        ];

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function updateCompany(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'company_reg_no' => 'nullable|string|max:255',
            'company_email' => 'required|email|max:255',
            'company_phone' => 'required|string|max:255',
            'company_address' => 'required|string',
            'company_bank_details' => 'nullable|string',
            'company_website' => 'nullable|url|max:255',
            'support_email' => 'nullable|email|max:255',
            'support_phone' => 'nullable|string|max:255',
            'support_hours' => 'nullable|string|max:255',
        ]);

        Setting::set('company_name', $validated['company_name'], 'company');
        Setting::set('company_reg_no', $validated['company_reg_no'] ?? '', 'company');
        Setting::set('company_email', $validated['company_email'], 'company');
        Setting::set('company_phone', $validated['company_phone'], 'company');
        Setting::set('company_address', $validated['company_address'], 'company');
        Setting::set('company_bank_details', $validated['company_bank_details'] ?? '', 'company');
        Setting::set('company_website', $validated['company_website'] ?? '', 'company');
        Setting::set('support_email', $validated['support_email'] ?? '', 'company');
        Setting::set('support_phone', $validated['support_phone'] ?? '', 'company');
        Setting::set('support_hours', $validated['support_hours'] ?? '', 'company');

        activity()
            ->causedBy($request->user())
            ->log('Updated Company / Academy Profile Settings');

        return back()->with('success', 'Company profile settings updated successfully.');
    }

    public function updateServices(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'chip_environment' => 'required|in:sandbox,live',
            'chip_brand_id' => 'nullable|string|max:255',
            'chip_api_key' => 'nullable|string|max:255',
            'chip_webhook_public_key' => 'nullable|string|max:2000',

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
            'whatsapp_access_token' => 'nullable|string|max:255',
            'whatsapp_phone_number_id' => 'nullable|string|max:255',
        ]);

        Setting::set('chip_environment', $validated['chip_environment'], 'chip');
        Setting::set('chip_brand_id', $validated['chip_brand_id'] ?? '', 'chip');
        Setting::set('chip_api_key', $validated['chip_api_key'] ?? '', 'chip', true);
        // Public key is not secret, so store it unencrypted.
        Setting::set('chip_webhook_public_key', $validated['chip_webhook_public_key'] ?? '', 'chip');

        Setting::set('mail_host', $validated['mail_host'], 'smtp');
        Setting::set('mail_port', $validated['mail_port'], 'smtp');
        Setting::set('mail_username', $validated['mail_username'] ?? '', 'smtp');
        Setting::set('mail_password', $validated['mail_password'] ?? '', 'smtp', true);
        Setting::set('mail_encryption', $validated['mail_encryption'] ?? 'tls', 'smtp');
        Setting::set('mail_from_address', $validated['mail_from_address'], 'smtp');
        Setting::set('mail_from_name', $validated['mail_from_name'], 'smtp');

        MailConfig::apply();

        Setting::set('whatsapp_provider', $validated['whatsapp_provider'], 'whatsapp');
        Setting::set('whatsapp_account_sid', $validated['whatsapp_account_sid'] ?? '', 'whatsapp');
        Setting::set('whatsapp_auth_token', $validated['whatsapp_auth_token'] ?? '', 'whatsapp', true);
        Setting::set('whatsapp_phone_number', $validated['whatsapp_phone_number'] ?? '', 'whatsapp');
        Setting::set('whatsapp_access_token', $validated['whatsapp_access_token'] ?? '', 'whatsapp', true);
        Setting::set('whatsapp_phone_number_id', $validated['whatsapp_phone_number_id'] ?? '', 'whatsapp');

        WhatsAppConfig::apply();

        activity()
            ->causedBy($request->user())
            ->log('Updated External Services Settings (Chip, SMTP, WhatsApp)');

        return back()->with('success', 'External services settings updated successfully.');
    }

    public function updateNotificationSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'notifications_enabled' => 'boolean',
            'notifications_daily_limit' => 'required|integer|min:1|max:10000',
            'notifications_retry_attempts' => 'required|integer|min:0|max:10',
            'notifications_retry_delay_minutes' => 'required|integer|min:1|max:1440',
            'notifications_admin_alert_email' => 'nullable|email|max:255',
        ]);

        Setting::set('notifications_enabled', $validated['notifications_enabled'], 'notifications');
        Setting::set('notifications_daily_limit', $validated['notifications_daily_limit'], 'notifications');
        Setting::set('notifications_retry_attempts', $validated['notifications_retry_attempts'], 'notifications');
        Setting::set('notifications_retry_delay_minutes', $validated['notifications_retry_delay_minutes'], 'notifications');
        Setting::set('notifications_admin_alert_email', $validated['notifications_admin_alert_email'] ?? '', 'notifications');

        activity()
            ->causedBy($request->user())
            ->log('Updated Notification System Settings');

        return back()->with('success', 'Notification system settings updated successfully.');
    }

    public function testSmtp(Request $request): RedirectResponse
    {
        $request->validate(['recipient' => 'required|email']);

        MailConfig::apply();

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

    public function testChip(): RedirectResponse
    {
        $brandId = Setting::get('chip_brand_id');
        $apiKey = Setting::get('chip_api_key');

        if (empty($brandId) || empty($apiKey)) {
            return back()->with('error', 'Chip Brand ID and API Key are required to test connection.');
        }

        try {
            // /purchases/ is POST-only, so use the GET /payment_methods/
            // lookup instead: it requires Bearer auth + brand_id, which
            // validates both the API key and the brand in a single call,
            // and returns the available payment methods in test/live mode.
            $response = Http::withToken($apiKey)->get(
                config('services.chip.base_url').'/payment_methods/',
                [
                    'brand_id' => $brandId,
                    'currency' => 'MYR',
                    'amount' => 1000,
                ]
            );

            if ($response->successful()) {
                $methods = collect($response->json('available_payment_methods', []));
                $summary = $methods->isNotEmpty()
                    ? 'Available methods: '.$methods->implode(', ')
                    : 'Connected (no methods returned for RM 10).';

                return back()->with('success', 'Chip API Connection Successful. '.$summary);
            }

            if (in_array($response->status(), [401, 403], true)) {
                return back()->with('error', 'Chip API rejected the API key (status '.$response->status().'). Verify the key and environment match.');
            }

            return back()->with('error', 'Chip API Test Returned Status Code: '.$response->status());
        } catch (\Exception $e) {
            return back()->with('error', 'Chip Connection Failed: '.$e->getMessage());
        }
    }

    public function testWhatsApp(Request $request): RedirectResponse
    {
        $request->validate(['phone' => 'required|string']);

        WhatsAppConfig::apply();

        $provider = Setting::get('whatsapp_provider', 'log');
        $authToken = Setting::get('whatsapp_auth_token');
        $accessToken = Setting::get('whatsapp_access_token');

        if ($provider === 'waba' && empty($accessToken)) {
            return back()->with('error', 'WhatsApp Cloud API access token is required.');
        }

        if ($provider !== 'waba' && empty($authToken)) {
            return back()->with('error', 'WhatsApp Auth Token / API Key is required.');
        }

        try {
            (new WhatsAppChannel)->send(
                $request->phone,
                'This is a test WhatsApp message from X Chess Academy OS settings panel.'
            );

            return back()->with('success', 'Test WhatsApp message sent to '.$request->phone.' via '.$provider.'.');
        } catch (\Exception $e) {
            return back()->with('error', 'WhatsApp Test Failed: '.$e->getMessage());
        }
    }

    public function uploadLogo(Request $request): RedirectResponse
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpg,jpeg,png,svg,webp|max:2048',
        ]);

        $disk = Storage::disk('public');

        $previous = Setting::get('company_logo');
        if ($previous && $disk->exists($previous)) {
            $disk->delete($previous);
        }

        $path = $request->file('logo')->store('logos', 'public');
        Setting::set('company_logo', $path, 'company');

        activity()
            ->causedBy($request->user())
            ->log('Uploaded academy logo');

        return back()->with('success', 'Logo uploaded successfully.');
    }

    public function removeLogo(Request $request): RedirectResponse
    {
        $logo = Setting::get('company_logo');

        if ($logo) {
            $disk = Storage::disk('public');
            if ($disk->exists($logo)) {
                $disk->delete($logo);
            }
            Setting::set('company_logo', '', 'company');
        }

        activity()
            ->causedBy($request->user())
            ->log('Removed academy logo');

        return back()->with('success', 'Logo removed.');
    }
}
