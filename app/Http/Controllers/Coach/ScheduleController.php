<?php

namespace App\Http\Controllers\Coach;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\ChessClass;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $targetCoachId = $user->id;
        if ($user->isAdmin() && $request->has('coach_id')) {
            $targetCoachId = $request->query('coach_id');
        }

        // Get filter inputs
        $month = $request->input('month', now()->format('Y-m')); // Format: YYYY-MM
        $startDate = $month.'-01';
        $endDate = Carbon::parse($startDate)->endOfMonth()->format('Y-m-d');

        // Fetch classes assigned to this coach (either as main coach or session override)
        $classes = ChessClass::with(['room', 'classSessions' => function ($q) use ($startDate, $endDate) {
            $q->whereBetween('session_date', [$startDate, $endDate]);
        }])
            ->where(function ($q) use ($targetCoachId, $startDate, $endDate) {
                $q->where('coach_id', $targetCoachId)
                    ->orWhereHas('classSessions', function ($sq) use ($targetCoachId, $startDate, $endDate) {
                        $sq->where('coach_id', $targetCoachId)
                            ->whereBetween('session_date', [$startDate, $endDate]);
                    });
            })
            ->get();

        // Optimize: Fetch existing attendance dates for all loaded classes in range
        $attendanceMap = Attendance::whereIn('class_id', $classes->pluck('id'))
            ->whereBetween('attendance_date', [$startDate, $endDate])
            ->select('class_id', 'attendance_date')
            ->distinct()
            ->get()
            ->groupBy('class_id')
            ->map(function ($items) {
                return $items->pluck('attendance_date')->map(function ($d) {
                    return is_string($d) ? $d : $d->format('Y-m-d');
                })->flip();
            });

        $schedules = collect();
        $today = now()->format('Y-m-d');

        foreach ($classes as $class) {
            $classSchedules = $class->schedules ?? [];

            // Get dates from schedules within range
            $scheduleDates = array_filter($classSchedules, function ($date) use ($startDate, $endDate) {
                return $date >= $startDate && $date <= $endDate;
            });

            // Get dates from actual sessions within range
            $sessionDates = $class->classSessions->map(function ($session) {
                return is_string($session->session_date)
                    ? $session->session_date
                    : $session->session_date->format('Y-m-d');
            })->toArray();

            // Merge and unique
            $allDates = array_unique(array_merge($scheduleDates, $sessionDates));
            sort($allDates);

            foreach ($allDates as $date) {
                $session = $class->classSessions->firstWhere('session_date', $date);

                // Determine effective coach
                $effectiveCoachId = $session?->coach_id ?? $class->coach_id;

                // Filter out if this specific session is not assigned to the target coach
                if ($effectiveCoachId != $targetCoachId) {
                    continue;
                }

                $isDelivered = isset($attendanceMap[$class->id]) && isset($attendanceMap[$class->id][$date]);

                // Optional: Filter out future dates that are not delivered if you only want to show past/today
                // But for "My Schedule", we probably want to see future dates too.

                $schedules->push([
                    'id' => $class->id,
                    'class_name' => $class->name ?? 'Class '.$class->id,
                    'room_name' => $class->room->name ?? 'N/A',
                    'start_time' => substr($class->start_time, 0, 5),
                    'end_time' => substr($class->end_time, 0, 5),
                    'topic' => $session?->topic ?? '',
                    'is_delivered' => $isDelivered,
                    'date' => $date,
                ]);
            }
        }

        // Sort by date asc
        $schedules = $schedules->sortBy('date')->values();

        $impersonatedCoach = null;
        if ($user->isAdmin() && $request->has('coach_id')) {
            $impersonatedCoach = User::find($targetCoachId);
        }

        return Inertia::render('Coach/Schedule/Index', [
            'schedules' => $schedules,
            'filters' => [
                'month' => $month,
            ],
            'impersonatedCoach' => $impersonatedCoach,
        ]);
    }
}
