<?php

namespace App\Services\Notifications\Channels;

use Illuminate\Support\Facades\Mail;

class EmailChannel
{
    public function send(string $toEmail, string $subject, string $body): void
    {
        Mail::send([], [], function ($message) use ($toEmail, $subject, $body) {
            $message->to($toEmail);
            $message->subject($subject);
            $message->html($body);
        });
    }
}
