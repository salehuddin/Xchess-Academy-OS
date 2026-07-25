<?php

namespace App\Services\Notifications;

class NotificationRenderer
{
    public function render(string $template, array $context): string
    {
        return preg_replace_callback('/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/', function ($matches) use ($context) {
            $key = $matches[1];
            $value = $context[$key] ?? '';
            if (is_array($value) || is_object($value)) {
                return '';
            }

            return (string) $value;
        }, $template) ?? $template;
    }
}
