<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Schema;

class WhatsAppConfig
{
    public static function apply(): void
    {
        if (! self::settingsTableExists()) {
            return;
        }

        $provider = Setting::get('whatsapp_provider');

        if (empty($provider) || $provider === 'log') {
            config(['services.whatsapp.driver' => 'log']);

            return;
        }

        config([
            'services.whatsapp.driver' => $provider,
            'services.whatsapp.twilio.account_sid' => Setting::get('whatsapp_account_sid'),
            'services.whatsapp.twilio.auth_token' => Setting::get('whatsapp_auth_token'),
            'services.whatsapp.twilio.from' => Setting::get('whatsapp_phone_number'),
            'services.whatsapp.meta_cloud.access_token' => Setting::get('whatsapp_access_token'),
            'services.whatsapp.meta_cloud.phone_number_id' => Setting::get('whatsapp_phone_number_id'),
            'services.whatsapp.ultramsg.instance_id' => Setting::get('whatsapp_account_sid'),
            'services.whatsapp.ultramsg.token' => Setting::get('whatsapp_auth_token'),
            'services.whatsapp.from' => Setting::get('whatsapp_phone_number'),
        ]);
    }

    public static function isConfigured(): bool
    {
        if (! self::settingsTableExists()) {
            return false;
        }

        $provider = Setting::get('whatsapp_provider');

        if (empty($provider) || $provider === 'log') {
            return false;
        }

        $token = Setting::get('whatsapp_auth_token');

        return ! empty($token);
    }

    protected static function settingsTableExists(): bool
    {
        try {
            return Schema::hasTable('settings');
        } catch (\Throwable $e) {
            return false;
        }
    }
}
