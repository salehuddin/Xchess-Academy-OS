<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'chip' => [
        // Chip exposes a single API host; test vs live is determined by the
        // API key (test keys vs live keys), not a separate sandbox subdomain.
        'base_url' => env('CHIP_API_BASE_URL', 'https://gate.chip-in.asia/api/v1'),
        'environment' => env('CHIP_ENVIRONMENT', 'sandbox'),
        'brand_id' => env('CHIP_BRAND_ID'),
        'api_key' => env('CHIP_API_KEY'),
        'webhook_public_key' => env('CHIP_WEBHOOK_PUBLIC_KEY'),
    ],

    'whatsapp' => [
        'driver' => env('WHATSAPP_DRIVER', 'log'),
        'from' => env('WHATSAPP_FROM'),
        'twilio' => [
            'account_sid' => env('TWILIO_ACCOUNT_SID'),
            'auth_token' => env('TWILIO_AUTH_TOKEN'),
            'from' => env('TWILIO_WHATSAPP_FROM'),
        ],
        'meta_cloud' => [
            'access_token' => env('META_WHATSAPP_ACCESS_TOKEN'),
            'phone_number_id' => env('META_WHATSAPP_PHONE_NUMBER_ID'),
        ],
        'ultramsg' => [
            'instance_id' => env('ULTRAMSG_INSTANCE_ID'),
            'token' => env('ULTRAMSG_TOKEN'),
        ],
    ],

];
