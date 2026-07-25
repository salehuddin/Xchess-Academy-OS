<?php

namespace App\Http\Controllers\Coach;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\ChessClass;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();

        // Admin impersonation logic
        $targetCoachId = $user->id;
        if ($user->isAdmin() && $request->has('coach_id')) {
            $targetCoachId = $request->query('coach_id');
        }

        // Count classes assigned to this coach
        $myClassesCount = ChessClass::where('coach_id', $targetCoachId)->count();

        // Get today's sessions
        $today = now()->format('Y-m-d');

        // Find classes where this coach is the default coach, or where they are assigned to a specific session today
        $classes = ChessClass::with(['room', 'classSessions' => function ($q) use ($today) {
            $q->where('session_date', $today);
        }])
            ->where(function ($q) use ($targetCoachId, $today) {
                $q->where('coach_id', $targetCoachId)
                    ->orWhereHas('classSessions', function ($sq) use ($targetCoachId, $today) {
                        $sq->where('coach_id', $targetCoachId)
                            ->where('session_date', $today);
                    });
            })
            ->get();

        $todaySessions = collect();

        foreach ($classes as $class) {
            $schedules = $class->schedules ?? [];
            $hasScheduleToday = in_array($today, $schedules);

            $session = $class->classSessions->firstWhere('session_date', $today);

            // If there's a session override for another coach, skip it
            if ($session && $session->coach_id && $session->coach_id !== (int) $targetCoachId) {
                continue;
            }

            // If the coach is only the default class coach, but no schedule today and no session today, skip
            if (! $hasScheduleToday && ! $session) {
                continue;
            }

            // Check if attendance is submitted
            $isSubmitted = Attendance::where('class_id', $class->id)
                ->where('attendance_date', $today)
                ->exists();

            $todaySessions->push([
                'id' => $class->id,
                'class_name' => $class->name ?? 'Class '.$class->id,
                'room_name' => $class->room->name ?? 'N/A',
                'start_time' => substr($class->start_time, 0, 5),
                'end_time' => substr($class->end_time, 0, 5),
                'status' => $isSubmitted ? 'Submitted' : 'Pending',
                'topic' => $session?->topic ?? '',
                'date' => $today,
            ]);
        }

        // Sort by start time
        $todaySessions = $todaySessions->sortBy('start_time')->values();

        $stats = [
            'my_classes' => $myClassesCount,
            'today_sessions_count' => $todaySessions->count(),
            'pending_attendance' => $todaySessions->where('status', 'Pending')->count(),
        ];

        $impersonatedCoach = null;
        if ($user->isAdmin() && $request->has('coach_id')) {
            $impersonatedCoach = User::find($targetCoachId);
        }

        return Inertia::render('Coach/Dashboard', [
            'stats' => $stats,
            'todaySessions' => $todaySessions,
            'impersonatedCoach' => $impersonatedCoach,
        ]);
    }
}
