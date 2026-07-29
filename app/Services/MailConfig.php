<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Schema;

class MailConfig
{
    /**
     * Apply SMTP settings from the database into Laravel's runtime mail config.
     * Safe to call during boot — silently returns if the settings table does
     * not yet exist (e.g. fresh install before migrations run) or when the
     * required keys are missing.
     */
    public static function apply(): void
    {
        if (! self::settingsTableExists()) {
            return;
        }

        $host = Setting::get('mail_host');
        $fromAddress = Setting::get('mail_from_address');

        if (empty($host) || empty($fromAddress)) {
            return;
        }

        $encryption = Setting::get('mail_encryption', 'tls');

        config([
            'mail.default' => 'smtp',
            'mail.mailers.smtp.host' => $host,
            'mail.mailers.smtp.port' => Setting::get('mail_port', 587),
            'mail.mailers.smtp.username' => Setting::get('mail_username'),
            'mail.mailers.smtp.password' => Setting::get('mail_password'),
            'mail.mailers.smtp.scheme' => self::schemeFor($encryption),
            'mail.from.address' => $fromAddress,
            'mail.from.name' => Setting::get('mail_from_name', config('app.name')),
        ]);
    }

    /**
     * Translate the UI "encryption" value into a Symfony Mailer "scheme".
     *
     * Symfony's SMTP transport only accepts "smtp", "smtps", or null —
     * NOT "tls"/"ssl" (those throw "scheme is not supported"). STARTTLS is
     * auto-negotiated by the "smtp" scheme when the server supports it.
     */
    protected static function schemeFor(string $encryption): ?string
    {
        return match ($encryption) {
            'ssl' => 'smtps',
            'none' => null,
            default => 'smtp',
        };
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
