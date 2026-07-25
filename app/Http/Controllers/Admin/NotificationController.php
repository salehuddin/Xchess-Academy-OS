<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\NotificationDispatch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(): Response
    {
        $notifications = Notification::query()
            ->latest()
            ->get();

        return Inertia::render('Admin/Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    public function dispatches(Request $request): Response
    {
        $query = NotificationDispatch::query()
            ->with('notification')
            ->orderByDesc('scheduled_for')
            ->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('channel')) {
            $query->where('channel', $request->string('channel'));
        }

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($q) use ($search) {
                $q->where('recipient', 'like', '%'.$search.'%')
                    ->orWhere('error', 'like', '%'.$search.'%');
            });
        }

        $perPage = (int) $request->input('per_page', 10);
        if (! in_array($perPage, [10, 25, 50, 100], true)) {
            $perPage = 10;
        }

        $dispatches = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Admin/Notifications/Dispatches', [
            'dispatches' => $dispatches,
            'filters' => $request->only(['status', 'channel', 'search', 'per_page']),
        ]);
    }

    public function settings(): Response
    {
        $mailDefault = config('mail.default');
        $smtp = config('mail.mailers.smtp');
        $from = config('mail.from');

        $whatsAppDriver = config('services.whatsapp.driver', 'log');
        $twilio = config('services.whatsapp.twilio', []);
        $meta = config('services.whatsapp.meta_cloud', []);

        $settings = [
            'mail' => [
                'default' => $mailDefault,
                'from' => [
                    'address' => $from['address'] ?? null,
                    'name' => $from['name'] ?? null,
                ],
                'smtp' => [
                    'host' => $smtp['host'] ?? null,
                    'port' => $smtp['port'] ?? null,
                    'scheme' => $smtp['scheme'] ?? null,
                    'username_set' => ! empty($smtp['username'] ?? null),
                    'password_set' => ! empty($smtp['password'] ?? null),
                ],
                'providers' => [
                    'postmark_key_set' => ! empty(config('services.postmark.key')),
                    'resend_key_set' => ! empty(config('services.resend.key')),
                    'ses_key_set' => ! empty(config('services.ses.key')),
                    'ses_secret_set' => ! empty(config('services.ses.secret')),
                ],
            ],
            'whatsapp' => [
                'driver' => $whatsAppDriver,
                'supported_drivers' => ['log', 'twilio', 'meta_cloud'],
                'twilio' => [
                    'account_sid_set' => ! empty($twilio['account_sid'] ?? null),
                    'auth_token_set' => ! empty($twilio['auth_token'] ?? null),
                    'from_set' => ! empty($twilio['from'] ?? null),
                ],
                'meta_cloud' => [
                    'access_token_set' => ! empty($meta['access_token'] ?? null),
                    'phone_number_id_set' => ! empty($meta['phone_number_id'] ?? null),
                ],
            ],
        ];

        return Inertia::render('Admin/Notifications/Settings', [
            'settings' => $settings,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Notifications/Create');
    }

    public function store(Request $request)
    {
        $data = $this->validateNotification($request);
        $data['created_by'] = Auth::id();

        Notification::create($data);

        return redirect()->route('admin.notifications.index')->with('success', 'Notification created.');
    }

    public function edit(Notification $notification): Response
    {
        return Inertia::render('Admin/Notifications/Edit', [
            'notification' => $notification,
        ]);
    }

    public function update(Request $request, Notification $notification)
    {
        $data = $this->validateNotification($request);
        $notification->update($data);

        return redirect()->route('admin.notifications.index')->with('success', 'Notification updated.');
    }

    public function destroy(Notification $notification)
    {
        $notification->delete();

        return redirect()->route('admin.notifications.index')->with('success', 'Notification deleted.');
    }

    private function validateNotification(Request $request): array
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'channel' => 'required|in:email,whatsapp',
            'trigger' => 'required|in:invoice_sent,invoice_overdue,announcement',
            'subject' => 'nullable|string|max:255',
            'body' => 'required|string',
            'is_active' => 'boolean',
            'class_mode' => 'nullable|in:All,Online,Physical',
            'schedule_days' => 'nullable|string',
        ]);

        $conditions = [
            'class_mode' => $validated['class_mode'] ?? 'All',
        ];

        $schedule = null;
        if (($validated['trigger'] ?? null) === 'invoice_overdue') {
            $days = collect(explode(',', $validated['schedule_days'] ?? '0'))
                ->map(fn ($d) => trim($d))
                ->filter(fn ($d) => $d !== '')
                ->map(fn ($d) => (int) $d)
                ->unique()
                ->sort()
                ->values()
                ->all();

            $schedule = [
                'type' => 'offset_days',
                'days' => $days,
            ];
        }

        return [
            'name' => $validated['name'],
            'channel' => $validated['channel'],
            'trigger' => $validated['trigger'],
            'subject' => $validated['channel'] === 'email' ? ($validated['subject'] ?? '') : null,
            'body' => $validated['body'],
            'is_active' => (bool) ($validated['is_active'] ?? true),
            'conditions' => $conditions,
            'schedule' => $schedule,
        ];
    }
}
