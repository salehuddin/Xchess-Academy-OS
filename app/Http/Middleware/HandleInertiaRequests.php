<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'academy' => fn () => [
                'name' => Setting::get('company_name', 'X Chess Academy'),
                'website' => Setting::get('company_website', 'https://xchessacademy.com'),
                'logo_url' => (function () {
                    $path = Setting::get('company_logo');
                    if (! $path) {
                        return null;
                    }

                    return Storage::disk('public')->url($path);
                })(),
                'support_email' => Setting::get('support_email', 'support@xchess-academy.com'),
                'support_phone' => Setting::get('support_phone'),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
