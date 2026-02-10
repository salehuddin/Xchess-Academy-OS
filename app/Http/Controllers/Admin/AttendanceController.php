<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\ClassSchedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $date = $request->input('date', now()->format('Y-m-d'));

        $schedules = ClassSchedule::with(['class.package', 'room', 'class.coach'])
            ->whereDate('start_time', $date)
            ->orderBy('start_time')
            ->get()
            ->map(fn ($schedule) => [
                'id' => $schedule->id,
                'class_name' => $schedule->class->package->title ?? 'Class ' . $schedule->class->id,
                'room_name' => $schedule->room->name,
                'start_time' => $schedule->start_time->format('H:i'),
                'end_time' => $schedule->end_time->format('H:i'),
                'coach_name' => $schedule->class->coach->name ?? 'Unassigned',
                'is_delivered' => $schedule->is_delivered,
            ]);

        return Inertia::render('Admin/Attendance/Index', [
            'schedules' => $schedules,
            'date' => $date,
        ]);
    }

    public function show(ClassSchedule $schedule): Response
    {
        $schedule->load(['class.students', 'attendances']);

        $students = $schedule->class->students->map(function ($student) use ($schedule) {
            $attendance = $schedule->attendances->firstWhere('student_id', $student->id);
            return [
                'id' => $student->id,
                'name' => $student->name,
                'is_present' => $attendance ? $attendance->is_present : false, // Default to absent if no record? Or maybe null?
                // If no record exists, it means attendance hasn't been taken or student wasn't marked.
                // For UI, maybe we want to show "Unmarked" state?
                // For now, let's assume boolean toggle.
                'attendance_id' => $attendance ? $attendance->id : null,
            ];
        });

        return Inertia::render('Admin/Attendance/Show', [
            'schedule' => [
                'id' => $schedule->id,
                'class_name' => $schedule->class->package->title ?? 'Class ' . $schedule->class->id,
                'start_time' => $schedule->start_time->format('H:i'),
                'date' => $schedule->start_time->format('Y-m-d'),
            ],
            'students' => $students,
        ]);
    }

    public function store(Request $request, ClassSchedule $schedule)
    {
        $data = $request->validate([
            'attendances' => 'required|array',
            'attendances.*.student_id' => 'required|exists:students,id',
            'attendances.*.is_present' => 'required|boolean',
        ]);

        foreach ($data['attendances'] as $record) {
            Attendance::updateOrCreate(
                [
                    'schedule_id' => $schedule->id,
                    'student_id' => $record['student_id'],
                ],
                [
                    'is_present' => $record['is_present'],
                    // 'manual_discount_pending' => !$record['is_present'], // Logic for discount? 
                    // PRD says: "If a class was missed (with notice), Finance calculates the discount... manual adjustment".
                    // So we probably don't auto-set discount pending here unless we have "with notice" info.
                    // For now, just track presence.
                ]
            );
        }

        // Mark schedule as delivered if attendance is taken?
        $schedule->update(['is_delivered' => true]);

        return redirect()->route('admin.attendances.index', ['date' => $schedule->start_time->format('Y-m-d')])
            ->with('success', 'Attendance saved successfully.');
    }
}
