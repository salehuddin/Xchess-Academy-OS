<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\SiteAnnouncement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    public function index(Request $request): Response
    {
        $announcements = SiteAnnouncement::published()
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->limit(5)
            ->get([
                'id',
                'title',
                'body',
                'type',
                'published_at',
            ])
            ->map(function (SiteAnnouncement $a) {
                return [
                    'id' => $a->id,
                    'title' => $a->title,
                    'body' => $a->body,
                    'type' => $a->type,
                    'published_at' => $a->published_at?->toIso8601String(),
                ];
            })
            ->values();

        $company = [
            'name' => Setting::get('company_name', 'X Chess Academy'),
            'email' => Setting::get('company_email'),
            'phone' => Setting::get('company_phone'),
            'address' => Setting::get('company_address'),
        ];

        $support = [
            'email' => Setting::get('support_email', 'support@xchess-academy.com'),
            'phone' => Setting::get('support_phone'),
            'hours' => Setting::get('support_hours', 'Mon-Fri, 9am - 6pm'),
        ];

        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'announcements' => $announcements,
            'company' => $company,
            'support' => $support,
        ]);
    }
}
