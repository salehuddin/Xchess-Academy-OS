<?php

namespace App\Http\Controllers\Notifications;

use App\Http\Controllers\Controller;
use App\Models\UserNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InboxController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = (int) $request->input('per_page', 15);
        if (! in_array($perPage, [15, 25, 50, 100], true)) {
            $perPage = 15;
        }

        $query = UserNotification::query()
            ->where('user_id', $request->user()->id)
            ->latest();

        if ($request->filled('filter') && $request->string('filter') === 'unread') {
            $query->whereNull('read_at');
        }

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        $notifications = $query->paginate($perPage)->withQueryString();

        $types = UserNotification::query()
            ->where('user_id', $request->user()->id)
            ->distinct()
            ->orderBy('type')
            ->pluck('type');

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'filters' => (object) $request->only(['filter', 'type', 'per_page']),
            'types' => $types,
        ]);
    }

    public function unread(Request $request): JsonResponse
    {
        $user = $request->user();

        $count = UserNotification::query()
            ->where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();

        $latest = UserNotification::query()
            ->where('user_id', $user->id)
            ->latest()
            ->limit(6)
            ->get(['id', 'type', 'title', 'body', 'url', 'read_at', 'created_at']);

        return response()->json([
            'count' => $count,
            'latest' => $latest,
        ]);
    }

    public function markRead(Request $request, int $id): JsonResponse|RedirectResponse
    {
        $notification = UserNotification::query()
            ->where('user_id', $request->user()->id)
            ->whereKey($id)
            ->first();

        if ($notification) {
            $notification->markRead();
        }

        if ($request->wantsJson()) {
            return response()->json(['ok' => true]);
        }

        return back();
    }

    public function markAllRead(Request $request): JsonResponse|RedirectResponse
    {
        UserNotification::markAllReadFor($request->user());

        if ($request->wantsJson()) {
            return response()->json(['ok' => true]);
        }

        return back();
    }
}
