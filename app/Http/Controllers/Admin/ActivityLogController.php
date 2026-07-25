<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    /**
     * Display a listing of user activity logs.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $eventFilter = $request->input('event');
        $logName = $request->input('log_name');

        $query = Activity::query()
            ->with(['causer', 'subject'])
            ->latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('event', 'like', "%{$search}%")
                    ->orWhereHas('causer', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($eventFilter) {
            $query->where('event', $eventFilter);
        }

        if ($logName) {
            $query->where('log_name', $logName);
        }

        $perPage = (int) $request->input('per_page', 10);
        if (! in_array($perPage, [10, 25, 50, 100], true)) {
            $perPage = 10;
        }

        $activities = $query->paginate($perPage)->withQueryString();

        $events = Activity::query()
            ->select('event')
            ->whereNotNull('event')
            ->distinct()
            ->pluck('event');

        return Inertia::render('Admin/ActivityLogs/Index', [
            'activities' => $activities,
            'filters' => [
                'search' => $search ?? '',
                'event' => $eventFilter ?? '',
                'log_name' => $logName ?? '',
            ],
            'events' => $events,
        ]);
    }
}
