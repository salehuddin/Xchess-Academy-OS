<?php

namespace App\Services\Notifications\Channels;

use Illuminate\Support\Facades\Log;

class WhatsAppChannel
{
    public function send(string $toPhone, string $body): void
    {
        $driver = config('services.whatsapp.driver', 'log');

        if ($driver === 'log') {
            Log::info('WhatsApp notification (log driver)', [
                'to' => $toPhone,
                'body' => $body,
            ]);

            return;
        }

        throw new \RuntimeException('WhatsApp driver not configured.');
    }
}
