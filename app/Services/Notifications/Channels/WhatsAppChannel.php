<?php

namespace App\Services\Notifications\Channels;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppChannel
{
    public function send(string $toPhone, string $body): void
    {
        $driver = config('services.whatsapp.driver', 'log');

        match ($driver) {
            'twilio' => $this->sendViaTwilio($toPhone, $body),
            'waba' => $this->sendViaWaba($toPhone, $body),
            'ultramsg' => $this->sendViaUltraMsg($toPhone, $body),
            default => $this->sendViaLog($toPhone, $body),
        };
    }

    protected function sendViaTwilio(string $toPhone, string $body): void
    {
        $sid = config('services.whatsapp.twilio.account_sid');
        $token = config('services.whatsapp.twilio.auth_token');
        $from = config('services.whatsapp.twilio.from');

        if (empty($sid) || empty($token) || empty($from)) {
            throw new \RuntimeException('Twilio WhatsApp credentials not configured (account_sid, auth_token, from number).');
        }

        $response = Http::withBasicAuth($sid, $token)
            ->asForm()
            ->post("https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json", [
                'From' => "whatsapp:{$from}",
                'To' => "whatsapp:{$toPhone}",
                'Body' => $body,
            ]);

        if (! $response->successful()) {
            throw new \RuntimeException('Twilio API error: '.$response->body());
        }
    }

    protected function sendViaWaba(string $toPhone, string $body): void
    {
        $accessToken = config('services.whatsapp.meta_cloud.access_token');
        $phoneNumberId = config('services.whatsapp.meta_cloud.phone_number_id');

        if (empty($accessToken) || empty($phoneNumberId)) {
            throw new \RuntimeException('Meta Cloud API credentials not configured (access_token, phone_number_id).');
        }

        $response = Http::withToken($accessToken)
            ->post("https://graph.facebook.com/v18.0/{$phoneNumberId}/messages", [
                'messaging_product' => 'whatsapp',
                'to' => $toPhone,
                'type' => 'text',
                'text' => ['body' => $body],
            ]);

        if (! $response->successful()) {
            throw new \RuntimeException('Meta Cloud API error: '.$response->body());
        }
    }

    protected function sendViaUltraMsg(string $toPhone, string $body): void
    {
        $instanceId = config('services.whatsapp.ultramsg.instance_id');
        $token = config('services.whatsapp.ultramsg.token');

        if (empty($instanceId) || empty($token)) {
            throw new \RuntimeException('UltraMsg credentials not configured (instance_id, token).');
        }

        $response = Http::asForm()
            ->post("https://api.ultramsg.com/{$instanceId}/messages/chat", [
                'token' => $token,
                'to' => $toPhone,
                'body' => $body,
            ]);

        if (! $response->successful()) {
            throw new \RuntimeException('UltraMsg API error: '.$response->body());
        }
    }

    protected function sendViaLog(string $toPhone, string $body): void
    {
        Log::info('WhatsApp notification (log driver)', [
            'to' => $toPhone,
            'body' => $body,
        ]);
    }
}
