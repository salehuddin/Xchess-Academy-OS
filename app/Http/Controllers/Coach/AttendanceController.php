<?php

namespace App\Http\Controllers\Coach;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\ChessClass;
use App\Models\ClassSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{
    private function authorizeCoachForClass(ChessClass $class, string $date)
    {
        $user = Auth::user();

        $targetCoachId = $user->id;
        if ($user->isAdmin() && request()->has('coach_id')) {
            $targetCoachId = request()->query('coach_id');
        }

        // Is coach the default class coach?
        $isClassCoach = $class->coach_id === (int) $targetCoachId;

        // Is coach assigned to this specific session?
        $session = ClassSession::where('class_id', $class->id)
            ->where('session_date', $date)
            ->first();

        $isSessionCoach = $session && $session->coach_id === (int) $targetCoachId;

        // Allow Admins to bypass this check if they aren't strictly impersonating,
        // but if they are impersonating, we check against the target coach.
        if (! $user->isAdmin() && ! $isClassCoach && ! $isSessionCoach) {
            abort(403, 'Unauthorized action.');
        }

        return $session;
    }

    public function show(ChessClass $class, string $date)
    {
        $session = $this->authorizeCoachForClass($class, $date);

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
        }]);

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

        $data = [
            'schedule' => [
                'id' => $class->id,
                'class_name' => $class->name ?? 'Class '.$class->id,
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
            'coaches' => [['id' => Auth::id(), 'name' => Auth::user()->name]], // Only themselves
            'date' => $date,
        ];

        return response()->json($data);
    }

    public function store(Request $request, ChessClass $class, string $date)
    {
        $this->authorizeCoachForClass($class, $date);

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

        // Force coach_id to be themselves (or null if they leave it empty, but it should default to them)
        $coachId = $data['coach_id'] ?? Auth::id();

        // Update Class Session info
        ClassSession::updateOrCreate(
            [
                'class_id' => $class->id,
                'session_date' => $date,
            ],
            [
                'topic' => $data['topic'] ?? null,
                'notes' => $data['notes'] ?? null,
                'coach_id' => $coachId,
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
}
