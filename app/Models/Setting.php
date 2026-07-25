<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class Setting extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'is_encrypted' => 'boolean',
    ];

    /**
     * Get a setting by key with an optional default value.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::query()->where('key', $key)->first();

        if (! $setting) {
            return $default;
        }

        if ($setting->is_encrypted && ! empty($setting->value)) {
            try {
                return Crypt::decryptString($setting->value);
            } catch (\Exception $e) {
                return $setting->value;
            }
        }

        return $setting->value ?? $default;
    }

    /**
     * Set a setting by key, value, and optional group.
     */
    public static function set(string $key, mixed $value, string $group = 'general', bool $encrypt = false): static
    {
        $storedValue = $value;

        if ($encrypt && ! empty($value)) {
            $storedValue = Crypt::encryptString($value);
        }

        return static::query()->updateOrCreate(
            ['key' => $key],
            [
                'value' => $storedValue,
                'group' => $group,
                'is_encrypted' => $encrypt,
            ]
        );
    }
}
