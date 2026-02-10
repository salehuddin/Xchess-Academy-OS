<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChessClass;
use App\Models\ClassSchedule;
use App\Models\Room;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

use App\Models\Package;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ScheduleController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('Admin/Schedules/Create', [
            'classes' => ChessClass::with('package')->get()->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->package->title . ' (' . $c->day . ' ' . $c->start_time . ')',
            ]),
            'rooms' => Room::all(),
            'preselectedClassId' => $request->input('class_id'),
        ]);
    }

    public function bulkCreate(): Response
    {
        return Inertia::render('Admin/Schedules/BulkCreate', [
            'packages' => Package::select('id', 'title')->get(),
            'days' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        ]);
    }

    public function preview(Request $request)
    {
        $request->validate([
            'package_id' => 'required|exists:packages,id',
            'day' => 'required|string',
            'month' => 'required|date_format:Y-m',
        ]);

        $startOfMonth = Carbon::parse($request->month)->startOfMonth();
        $endOfMonth = Carbon::parse($request->month)->endOfMonth();

        // 1. Find all matching classes
        $classes = ChessClass::where('package_id', $request->package_id)
            ->where('day', $request->day)
            ->with(['room', 'coach']) // Load related data for display if needed
            ->get();

        if ($classes->isEmpty()) {
            return response()->json([
                'dates' => [],
                'classes_count' => 0,
                'classes_preview' => []
            ]);
        }

        // 2. Calculate all dates for this day in the month
        $dates = [];
        $date = $startOfMonth->copy();

        // Find first occurrence of the day
        while ($date->format('l') !== $request->day) {
            $date->addDay();
        }

        // Add all occurrences
        while ($date->lte($endOfMonth)) {
            $dates[] = $date->format('Y-m-d');
            $date->addWeek();
        }

        return response()->json([
            'dates' => $dates,
            'classes_count' => $classes->count(),
            'classes_preview' => $classes->map(fn($c) => [
                'id' => $c->id,
                'time' => $c->start_time . ' - ' . $c->end_time,
                'room' => $c->room?->name ?? 'No Default Room',
                'coach' => $c->coach?->name ?? 'No Coach',
            ])
        ]);
    }

    public function bulkStore(Request $request): RedirectResponse
    {
        $request->validate([
            'package_id' => 'required|exists:packages,id',
            'day' => 'required|string',
            'dates' => 'required|array',
            'dates.*' => 'date',
        ]);

        $classes = ChessClass::where('package_id', $request->package_id)
            ->where('day', $request->day)
            ->get();

        if ($classes->isEmpty()) {
            return back()->withErrors(['package_id' => 'No classes found for this selection.']);
        }

        $createdCount = 0;
        $skippedCount = 0;
        $conflictCount = 0;

        DB::transaction(function () use ($classes, $request, &$createdCount, &$skippedCount, &$conflictCount) {
            foreach ($classes as $class) {
                foreach ($request->dates as $dateStr) {
                    // Combine date with class start/end times
                    $startDateTime = Carbon::parse($dateStr . ' ' . $class->start_time);
                    $endDateTime = Carbon::parse($dateStr . ' ' . $class->end_time);

                    // Skip if exists
                    $exists = ClassSchedule::where('class_id', $class->id)
                        ->where('start_time', $startDateTime)
                        ->exists();

                    if ($exists) {
                        $skippedCount++;
                        continue;
                    }

                    // Check for room conflict if room is assigned
                    if ($class->room_id) {
                        $conflict = ClassSchedule::where('room_id', $class->room_id)
                            ->where('start_time', '<', $endDateTime)
                            ->where('end_time', '>', $startDateTime)
                            ->exists();

                        if ($conflict) {
                            $conflictCount++;
                            continue;
                        }
                    }

                    ClassSchedule::create([
                        'class_id' => $class->id,
                        'room_id' => $class->room_id,
                        'start_time' => $startDateTime,
                        'end_time' => $endDateTime,
                        'is_delivered' => false,
                    ]);
                    $createdCount++;
                }
            }
        });

        $message = "Generated $createdCount schedules.";
        if ($skippedCount > 0) $message .= " Skipped $skippedCount duplicates.";
        if ($conflictCount > 0) $message .= " Skipped $conflictCount due to room conflicts.";

        return redirect()->route('admin.schedules.bulk-create')->with('success', $message);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'class_id' => 'required|exists:classes,id',
            'room_id' => 'required|exists:rooms,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
        ]);

        // Check for room conflict
        // Overlap logic: (StartA < EndB) and (EndA > StartB)
        $conflict = ClassSchedule::where('room_id', $request->room_id)
            ->where('start_time', '<', $request->end_time)
            ->where('end_time', '>', $request->start_time)
            ->exists();

        if ($conflict) {
            throw ValidationException::withMessages([
                'room_id' => ['The room is already booked for this time slot.'],
            ]);
        }

        ClassSchedule::create($request->only(['class_id', 'room_id', 'start_time', 'end_time']));

        return redirect()->back()->with('success', 'Schedule created successfully.');
    }
}
