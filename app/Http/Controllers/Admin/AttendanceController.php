<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\ChessClass;
use App\Models\ClassSession;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->endOfMonth()->format('Y-m-d'));
        $classId = $request->input('class_id');
        $coachId = $request->input('coach_id');

        // Fetch active classes with potential schedules in range
        $query = ChessClass::query()
            ->with(['package', 'room', 'coach', 'classSessions' => function ($q) use ($startDate, $endDate) {
                $q->whereBetween('session_date', [$startDate, $endDate]);
            }, 'classSessions.coach']);

        if ($classId) {
            $query->where('id', $classId);
        }

        // If filtering by coach, we need to check both class coach AND session coach
        // But since session coach overrides class coach, we can't easily filter at DB level for "effective coach"
        // without complex joins. For simplicity, we'll filter by Class Coach here and refine later,
        // OR we just fetch potentially relevant classes and filter in PHP.
        // Let's filter by Class Coach at DB level if no session overrides, but that's risky.
        // Better: Fetch all potentially relevant classes and filter in PHP.
        // Optimization: If coachId is set, only fetch classes where coach_id is coachId OR classes that have sessions with coachId.
        if ($coachId) {
            $query->where(function ($q) use ($coachId) {
                $q->where('coach_id', $coachId)
                    ->orWhereHas('classSessions', function ($sq) use ($coachId) {
                        $sq->where('coach_id', $coachId);
                    });
            });
        }

        $classes = $query->get();

        // Optimize: Fetch existing attendance dates for all loaded classes in range
        $attendanceMap = Attendance::whereIn('class_id', $classes->pluck('id'))
            ->whereBetween('attendance_date', [$startDate, $endDate])
            ->select('class_id', 'attendance_date')
            ->distinct()
            ->get()
            ->groupBy('class_id')
            ->map(function ($items) {
                return $items->pluck('attendance_date')->map(function ($d) {
                    return $d instanceof \DateTime ? $d->format('Y-m-d') : $d;
                })->flip(); // Flip to use isset
            });

        $schedules = collect();
        $today = now()->format('Y-m-d');

        foreach ($classes as $class) {
            $classSchedules = $class->schedules ?? [];

            // Get dates from schedules within range
            $scheduleDates = array_filter($classSchedules, function ($date) use ($startDate, $endDate) {
                return $date >= $startDate && $date <= $endDate;
            });

            // Get dates from actual sessions within range (already loaded constrained)
            $sessionDates = $class->classSessions->map(function ($session) {
                return $session->session_date instanceof \DateTime
                    ? $session->session_date->format('Y-m-d')
                    : $session->session_date;
            })->toArray();

            // Merge and unique
            $allDates = array_unique(array_merge($scheduleDates, $sessionDates));
            sort($allDates);

            foreach ($allDates as $date) {
                // Get session info if exists
                // Note: classSessions is constrained by date range, so firstWhere is safe
                $session = $class->classSessions->first(function ($s) use ($date) {
                    $d = $s->session_date instanceof \DateTime ? $s->session_date->format('Y-m-d') : $s->session_date;

                    return $d === $date;
                });

                // Determine effective coach
                $effectiveCoachId = $session?->coach_id ?? $class->coach_id;

                // Filter by Coach if set
                if ($coachId && $effectiveCoachId != $coachId) {
                    continue;
                }

                $isDelivered = isset($attendanceMap[$class->id]) && isset($attendanceMap[$class->id][$date]);

                // Filter out future dates that are not delivered (unless explicitly filtering by start_date)
                if ($date > $today && ! $isDelivered && ! $request->has('start_date')) {
                    continue;
                }

                $schedules->push([
                    'id' => $class->id,
                    'class_name' => $class->name ?? $class->package->title ?? 'Class '.$class->id,
                    'room_name' => $class->room->name ?? 'N/A',
                    'start_time' => substr($class->start_time, 0, 5),
                    'end_time' => substr($class->end_time, 0, 5),
                    'coach_name' => $session->coach->name ?? $class->coach->name ?? 'Unassigned',
                    'topic' => $session?->topic ?? '', // Added topic
                    'is_delivered' => $isDelivered,
                    'date' => $date,
                ]);
            }
        }

        // Sort by date desc
        $schedules = $schedules->sortByDesc('date')->values();

        // Pagination (manual)
        $perPage = (int) $request->input('per_page', 10);
        if (! in_array($perPage, [10, 25, 50, 100], true)) {
            $perPage = 10;
        }
        $page = (int) $request->input('page', 1);
        $paginated = new LengthAwarePaginator(
            $schedules->forPage($page, $perPage)->values(),
            $schedules->count(),
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        $allClasses = ChessClass::select('id', 'name', 'uid')->get();
        $allCoaches = User::coaches()->select(['id', 'name'])->get();

        return Inertia::render('Admin/Attendance/Index', [
            'schedules' => $paginated,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'class_id' => $classId,
                'coach_id' => $coachId,
                'per_page' => $perPage,
            ],
            'classes' => $allClasses,
            'coaches' => $allCoaches,
        ]);
    }

    public function show(ChessClass $class, string $date)
    {
        // 1. Fetch attendances for this specific class and date
        $attendances = Attendance::where('class_id', $class->id)
            ->where('attendance_date', $date)
            ->get();

        // 2. Get IDs of students who already have an attendance record (Active or not)
        $attendedStudentIds = $attendances->pluck('student_id')->toArray();

        // 3. Load students who are EITHER (Active) OR (Have an attendance record for this date)
        $class->load(['students' => function ($query) use ($attendedStudentIds) {
            $query->where(function ($q) use ($attendedStudentIds) {
                $q->where('students.status', 'Active')
                    ->orWhereIn('students.id', $attendedStudentIds);
            });
        }, 'coach']);

        $session = ClassSession::where('class_id', $class->id)
            ->where('session_date', $date)
            ->first();

        $students = $class->students->map(function ($student) use ($attendances) {
            $attendance = $attendances->firstWhere('student_id', $student->id);

            return [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'student_uid' => $student->student_uid,
                'status' => $student->status,
                'is_present' => $attendance ? $attendance->is_present : false,
                'attendance_id' => $attendance ? $attendance->id : null,
            ];
        });

        $coaches = User::coaches()->select(['id', 'name'])->get();

        $data = [
            'schedule' => [
                'id' => $class->id,
                'class_name' => $class->name ?? $class->package->title ?? 'Class '.$class->id,
                'room_name' => $class->room->name ?? 'N/A',
                'start_time' => substr($class->start_time, 0, 5),
                'end_time' => substr($class->end_time, 0, 5),
                'date' => $date,
                'coach_id' => $session?->coach_id ?? $class->coach_id,
                'topic' => $session?->topic ?? '',
                'notes' => $session?->notes ?? '',
                'is_delivered' => (bool) $session,
            ],
            'students' => $students,
            'coaches' => $coaches,
            'date' => $date,
        ];

        if (request()->wantsJson()) {
            return response()->json($data);
        }

        return Inertia::render('Admin/Attendance/Show', $data);
    }

    public function store(Request $request, ChessClass $class, string $date)
    {
        if ($date > now()->format('Y-m-d')) {
            return back()->withErrors(['date' => 'Cannot take attendance for future dates.']);
        }

        $data = $request->validate([
            'attendances' => 'required|array',
            'attendances.*.student_id' => 'required|exists:students,id',
            'attendances.*.is_present' => 'required|boolean',
            'topic' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'coach_id' => 'nullable|exists:users,id',
        ]);

        // Update Class Session info
        ClassSession::updateOrCreate(
            [
                'class_id' => $class->id,
                'session_date' => $date,
            ],
            [
                'topic' => $data['topic'] ?? null,
                'notes' => $data['notes'] ?? null,
                'coach_id' => $data['coach_id'] ?? null,
            ]
        );

        foreach ($data['attendances'] as $record) {
            Attendance::updateOrCreate(
                [
                    'class_id' => $class->id,
                    'attendance_date' => $date,
                    'student_id' => $record['student_id'],
                ],
                [
                    'is_present' => $record['is_present'],
                ]
            );
        }

        return back()->with('success', 'Attendance saved successfully.');
    }

    public function destroy(ChessClass $class, string $date)
    {
        // Delete class session
        ClassSession::where('class_id', $class->id)
            ->where('session_date', $date)
            ->delete();

        // Delete attendance records
        Attendance::where('class_id', $class->id)
            ->where('attendance_date', $date)
            ->delete();

        return back()->with('success', 'Attendance record deleted successfully.');
    }
}
