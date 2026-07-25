<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\ChessClass;
use App\Models\ClassSession;
use App\Models\Package;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    /**
     * Display the schedule management page.
     */
    public function index()
    {
        return redirect()->route('admin.schedules.generator');
    }

    /**
     * Show the Schedule Generator page.
     */
    public function generator(): Response
    {
        return Inertia::render('Admin/Schedules/Generator', [
            'packages' => Package::select('id', 'title')->get(),
        ]);
    }

    /**
     * Preview the schedule for a given month and packages.
     */
    public function preview(Request $request)
    {
        $request->validate([
            'month' => 'required|date_format:Y-m',
            'package_ids' => 'array|exists:packages,id',
        ]);

        $startOfMonth = Carbon::parse($request->month)->startOfMonth();
        $endOfMonth = Carbon::parse($request->month)->endOfMonth();

        // 1. Fetch Classes
        $query = ChessClass::query()->with('package');
        if ($request->filled('package_ids')) {
            $query->whereIn('package_id', $request->package_ids);
        }
        $classes = $query->get();

        // 2. Calculate potential dates for each class
        // We want to aggregate this to show "Busy Days" on the calendar
        $calendarData = [];

        foreach ($classes as $class) {
            if (! $class->day) {
                continue;
            }

            $dates = $this->getPotentialDatesForClass($class, $startOfMonth, $endOfMonth);

            foreach ($dates as $date) {
                if (! isset($calendarData[$date])) {
                    $calendarData[$date] = [
                        'date' => $date,
                        'count' => 0,
                        'classes' => [],
                    ];
                }
                $calendarData[$date]['count']++;
                // Limit the number of classes sent to frontend to avoid payload bloat
                if ($calendarData[$date]['count'] <= 5) {
                    $calendarData[$date]['classes'][] = $class->name ?? $class->uid;
                }
            }
        }

        return response()->json([
            'calendar' => array_values($calendarData),
            'total_classes' => $classes->count(),
        ]);
    }

    /**
     * Generate and save schedules for the month.
     */
    public function store(Request $request)
    {
        $request->validate([
            'month' => 'required|date_format:Y-m',
            'package_ids' => 'array|exists:packages,id',
            'excluded_dates' => 'array', // Dates to skip (Academy Closed)
            'excluded_dates.*' => 'date_format:Y-m-d',
        ]);

        $startOfMonth = Carbon::parse($request->month)->startOfMonth();
        $endOfMonth = Carbon::parse($request->month)->endOfMonth();
        $excludedDates = collect($request->excluded_dates)->map(fn ($d) => Carbon::parse($d)->format('Y-m-d'))->flip();

        $query = ChessClass::query()->with('package');
        if ($request->filled('package_ids')) {
            $query->whereIn('package_id', $request->package_ids);
        }
        $classes = $query->get();
        $updatedCount = 0;

        DB::transaction(function () use ($classes, $startOfMonth, $endOfMonth, $excludedDates, &$updatedCount) {
            foreach ($classes as $class) {
                if (! $class->day) {
                    continue;
                }

                // 1. Get existing schedules
                $currentSchedules = collect($class->schedules ?? []);

                // 2. Remove dates belonging to this month (we are regenerating)
                $keptSchedules = $currentSchedules->filter(function ($date) use ($startOfMonth, $endOfMonth) {
                    $d = Carbon::parse($date);

                    return $d->lt($startOfMonth) || $d->gt($endOfMonth);
                });

                // 3. Calculate new dates
                $potentialDates = $this->getPotentialDatesForClass($class, $startOfMonth, $endOfMonth);

                // 4. Filter excluded dates
                $validDates = collect($potentialDates)->filter(function ($date) use ($excludedDates) {
                    return ! $excludedDates->has($date);
                });

                // 5. Apply Package Limits (sessions per month)
                // If package defines sessions_per_month, limit the number of sessions
                $limit = $class->package->sessions_per_month ?? $class->sessions_per_month;
                if ($limit && $limit > 0) {
                    $validDates = $validDates->take($limit);
                }

                // 6. Merge and Save
                $finalSchedules = $keptSchedules->merge($validDates)
                    ->unique()
                    ->sort()
                    ->values()
                    ->all();

                $class->update(['schedules' => $finalSchedules]);
                $updatedCount++;
            }
        });

        return redirect()->back()->with('success', "Schedules generated for $updatedCount classes.");
    }

    /**
     * Helper to get all dates for a class in a range based on its day of week.
     */
    private function getPotentialDatesForClass($class, $start, $end)
    {
        $dates = [];
        $date = $start->copy();

        // Find first occurrence
        // $class->day is like "Monday", "Tuesday"
        while ($date->format('l') !== $class->day && $date->lte($end)) {
            $date->addDay();
        }

        if ($date->gt($end)) {
            return [];
        }

        // Add all occurrences
        while ($date->lte($end)) {
            $dates[] = $date->format('Y-m-d');
            $date->addWeek();
        }

        return $dates;
    }

    /**
     * Preview schedule deletion.
     */
    public function previewClear(Request $request)
    {
        $request->validate([
            'month' => 'required|date_format:Y-m',
            'package_ids' => 'array|exists:packages,id',
        ]);

        $startOfMonth = Carbon::parse($request->month)->startOfMonth();
        $endOfMonth = Carbon::parse($request->month)->endOfMonth();

        $query = ChessClass::query();
        if ($request->filled('package_ids')) {
            $query->whereIn('package_id', $request->package_ids);
        }
        $classes = $query->get();

        $totalSchedules = 0;
        $protectedSchedules = 0;
        $deletableSchedules = 0;

        foreach ($classes as $class) {
            $schedules = $class->schedules ?? [];
            $datesInRange = [];

            foreach ($schedules as $date) {
                $d = Carbon::parse($date);
                if ($d->between($startOfMonth, $endOfMonth)) {
                    $datesInRange[] = $date;
                }
            }

            if (empty($datesInRange)) {
                continue;
            }

            $totalSchedules += count($datesInRange);

            // Fetch protected dates in bulk for this class
            $protectedDates = collect();

            $attendanceDates = Attendance::where('class_id', $class->id)
                ->whereIn('attendance_date', $datesInRange)
                ->pluck('attendance_date');

            $sessionDates = ClassSession::where('class_id', $class->id)
                ->whereIn('session_date', $datesInRange)
                ->pluck('session_date');

            $protectedDates = $protectedDates->merge($attendanceDates)->merge($sessionDates)
                ->map(fn ($date) => is_string($date) ? $date : $date->format('Y-m-d'))
                ->unique();

            $protectedCount = $protectedDates->count();
            $protectedSchedules += $protectedCount;
            $deletableSchedules += (count($datesInRange) - $protectedCount);
        }

        return response()->json([
            'total_classes' => $classes->count(),
            'total_schedules' => $totalSchedules,
            'protected_schedules' => $protectedSchedules,
            'deletable_schedules' => $deletableSchedules,
        ]);
    }

    /**
     * Clear schedules.
     */
    public function clear(Request $request)
    {
        $request->validate([
            'month' => 'required|date_format:Y-m',
            'package_ids' => 'array|exists:packages,id',
        ]);

        $startOfMonth = Carbon::parse($request->month)->startOfMonth();
        $endOfMonth = Carbon::parse($request->month)->endOfMonth();

        $query = ChessClass::query();
        if ($request->filled('package_ids')) {
            $query->whereIn('package_id', $request->package_ids);
        }
        $classes = $query->get();
        $deletedCount = 0;

        DB::transaction(function () use ($classes, $startOfMonth, $endOfMonth, &$deletedCount) {
            foreach ($classes as $class) {
                $currentSchedules = collect($class->schedules ?? []);

                // Identify dates in range
                $datesInRange = $currentSchedules->filter(function ($date) use ($startOfMonth, $endOfMonth) {
                    $d = Carbon::parse($date);

                    return $d->between($startOfMonth, $endOfMonth);
                })->values()->all();

                if (empty($datesInRange)) {
                    continue;
                }

                // Find protected dates
                $protectedDates = collect();

                $attendanceDates = Attendance::where('class_id', $class->id)
                    ->whereIn('attendance_date', $datesInRange)
                    ->pluck('attendance_date');

                $sessionDates = ClassSession::where('class_id', $class->id)
                    ->whereIn('session_date', $datesInRange)
                    ->pluck('session_date');

                $protectedDates = $protectedDates
                    ->merge($attendanceDates)
                    ->merge($sessionDates)
                    ->map(fn ($date) => is_string($date) ? $date : $date->format('Y-m-d'))
                    ->unique()
                    ->flip(); // Flip for fast lookup

                // Filter schedules
                $newSchedules = $currentSchedules->filter(function ($date) use ($datesInRange, $protectedDates, &$deletedCount) {
                    // If date is NOT in the target range, keep it
                    if (! in_array($date, $datesInRange)) {
                        return true;
                    }

                    // If date IS in range, check if protected
                    if ($protectedDates->has($date)) {
                        return true;
                    }

                    // Otherwise delete
                    $deletedCount++;

                    return false;
                })->values()->all();

                if (count($newSchedules) !== count($currentSchedules)) {
                    $class->update(['schedules' => $newSchedules]);
                }
            }
        });

        return redirect()->back()->with('success', "Cleared $deletedCount schedules.");
    }
}
