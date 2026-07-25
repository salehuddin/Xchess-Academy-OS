<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\ChessClass;
use App\Models\ClassSession;
use App\Models\Package;
use App\Models\Room;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClassController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ChessClass::with(['coach', 'package', 'room'])
            ->withCount('students');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('coach', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('package', function ($q) use ($search) {
                        $q->where('title', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->has('sort')) {
            $sortColumn = $request->sort;
            $sortDirection = $request->direction ?? 'asc';

            if ($sortColumn === 'coach') {
                // Sorting by related column is trickier, simplifying for now
                // or handle specific columns if needed.
            } else {
                $query->orderBy($sortColumn, $sortDirection);
            }
        } else {
            $query->latest();
        }

        $perPage = (int) $request->input('per_page', 10);
        if (! in_array($perPage, [10, 25, 50, 100], true)) {
            $perPage = 10;
        }

        $classes = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Admin/Classes/Index', [
            'classes' => $classes,
            'coaches' => User::coaches()->select(['id', 'name'])->get(),
            'packages' => Package::all(['id', 'title', 'sessions_per_month']),
            'rooms' => Room::all(['id', 'name', 'mode', 'location', 'platform']),
            'filters' => $request->only(['search', 'sort', 'direction', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Classes/Create', [
            'coaches' => User::coaches()->select(['id', 'name'])->get(),
            'packages' => Package::all(['id', 'title', 'sessions_per_month']),
            'rooms' => Room::all(['id', 'name', 'mode', 'location', 'platform']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'coach_id' => [
                'nullable',
                'exists:users,id',
                function ($attribute, $value, $fail) use ($request) {
                    if (! $value || ! $request->start_time || ! $request->end_time) {
                        return;
                    }
                    $clash = ChessClass::where('coach_id', $value)
                        ->where('day', $request->day)
                        ->where(function ($q) use ($request) {
                            $q->where('start_time', '<', $request->end_time)
                                ->where('end_time', '>', $request->start_time);
                        })
                        ->exists();
                    if ($clash) {
                        $fail('The selected coach is already booked for this time slot.');
                    }
                },
            ],
            'package_id' => 'required|exists:packages,id',
            'status' => 'required|in:Active,Pending,Paused,Stopped',
            'mode' => 'required|in:Online,Physical',
            'day' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room_id' => [
                'required',
                'exists:rooms,id',
                function ($attribute, $value, $fail) use ($request) {
                    if (! $request->start_time || ! $request->end_time) {
                        return;
                    }

                    $clash = ChessClass::where('room_id', $value)
                        ->where('day', $request->day)
                        ->where(function ($q) use ($request) {
                            $q->where('start_time', '<', $request->end_time)
                                ->where('end_time', '>', $request->start_time);
                        })
                        ->exists();
                    if ($clash) {
                        $fail('The selected room is already booked for this time slot.');
                    }
                },
            ],
            'zoom_link' => 'nullable|url',
            'meeting_id' => 'nullable|string',
            'link_expiry' => 'nullable|date',
        ]);

        $package = Package::find($validated['package_id']);
        $validated['sessions_per_month'] = $package->sessions_per_month;

        ChessClass::create($validated);

        return redirect()->back()->with('success', 'Class created successfully.');
    }

    public function update(Request $request, ChessClass $class)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'coach_id' => [
                'nullable',
                'exists:users,id',
                function ($attribute, $value, $fail) use ($request, $class) {
                    if (! $value || ! $request->start_time || ! $request->end_time) {
                        return;
                    }
                    $clash = ChessClass::where('coach_id', $value)
                        ->where('id', '!=', $class->id)
                        ->where('day', $request->day)
                        ->where(function ($q) use ($request) {
                            $q->where('start_time', '<', $request->end_time)
                                ->where('end_time', '>', $request->start_time);
                        })
                        ->exists();
                    if ($clash) {
                        $fail('The selected coach is already booked for this time slot.');
                    }
                },
            ],
            'package_id' => 'required|exists:packages,id',
            'status' => 'required|in:Active,Pending,Paused,Stopped',
            'mode' => 'required|in:Online,Physical',
            'day' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room_id' => [
                'required',
                'exists:rooms,id',
                function ($attribute, $value, $fail) use ($request, $class) {
                    if (! $request->start_time || ! $request->end_time) {
                        return;
                    }

                    $clash = ChessClass::where('room_id', $value)
                        ->where('id', '!=', $class->id)
                        ->where('day', $request->day)
                        ->where(function ($q) use ($request) {
                            $q->where('start_time', '<', $request->end_time)
                                ->where('end_time', '>', $request->start_time);
                        })
                        ->exists();
                    if ($clash) {
                        $fail('The selected room is already booked for this time slot.');
                    }
                },
            ],
            'zoom_link' => 'nullable|url',
            'meeting_id' => 'nullable|string',
            'link_expiry' => 'nullable|date',
        ]);

        // Update sessions_per_month if package changed
        if ($class->package_id != $validated['package_id']) {
            $package = Package::find($validated['package_id']);
            $validated['sessions_per_month'] = $package->sessions_per_month;
        }

        $class->update($validated);

        return redirect()->back()->with('success', 'Class updated successfully.');
    }

    public function updateSchedules(Request $request, ChessClass $class)
    {
        $request->validate([
            'schedules' => 'array',
            'schedules.*' => 'date_format:Y-m-d',
        ]);

        // Sort dates
        $schedules = $request->schedules ?? [];
        sort($schedules);

        // Safety Check: Prevent deleting schedules that have attendance or session data
        $currentSchedules = $class->schedules ?? [];
        $removedDates = array_diff($currentSchedules, $schedules);

        if (! empty($removedDates)) {
            $hasAttendance = Attendance::where('class_id', $class->id)
                ->whereIn('attendance_date', $removedDates)
                ->exists();

            $hasSession = ClassSession::where('class_id', $class->id)
                ->whereIn('session_date', $removedDates)
                ->exists();

            if ($hasAttendance || $hasSession) {
                return redirect()->back()->withErrors(['schedules' => 'Cannot remove schedules that have existing attendance or session records. Please delete the attendance first.']);
            }
        }

        $class->update(['schedules' => $schedules]);

        return redirect()->back()->with('success', 'Class schedules updated.');
    }

    public function destroy(ChessClass $class)
    {
        $class->delete();

        return redirect()->route('admin.classes.index')->with('success', 'Class deleted successfully.');
    }

    public function show(ChessClass $class): Response
    {
        $class->load(['coach', 'package', 'students', 'room', 'classSessions.coach']);

        $attendanceCounts = Attendance::where('class_id', $class->id)
            ->where('is_present', true)
            ->selectRaw('attendance_date, count(*) as count')
            ->groupBy('attendance_date')
            ->pluck('count', 'attendance_date');

        return Inertia::render('Admin/Classes/Show', [
            'chessClass' => $class,
            'attendanceCounts' => $attendanceCounts,
            'allClasses' => ChessClass::with(['coach'])
                ->withCount('students')
                ->select('id', 'name', 'uid', 'day', 'start_time', 'end_time', 'coach_id', 'status')
                ->orderBy('name')
                ->get()
                ->map(fn ($item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'uid' => $item->uid,
                    'day' => $item->day,
                    'start_time' => $item->start_time,
                    'end_time' => $item->end_time,
                    'coach' => $item->coach?->name,
                    'students_count' => $item->students_count,
                    'status' => $item->status,
                ]),
            'availableStudents' => Student::whereDoesntHave('classes', function ($q) use ($class) {
                $q->where('class_id', $class->id);
            })->orderBy('name')->get(['id', 'name', 'student_uid']),
        ]);
    }
}
