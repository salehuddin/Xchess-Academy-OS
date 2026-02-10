<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\ChessClass;
use App\Models\Package;
use App\Models\Room;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
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
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                ->orWhereHas('coach', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })
                ->orWhereHas('package', function($q) use ($search) {
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

        $classes = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Classes/Index', [
            'classes' => $classes,
            'coaches' => User::where('role', UserRole::Coach->value)->get(['id', 'name']),
            'packages' => Package::all(['id', 'title', 'sessions_per_month']),
            'rooms' => Room::all(['id', 'name', 'mode', 'location', 'platform']),
            'filters' => $request->only(['search', 'sort', 'direction']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Classes/Create', [
            'coaches' => User::where('role', UserRole::Coach->value)->get(['id', 'name']),
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
                    if (!$value || !$request->start_time || !$request->end_time) {
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
                    if (!$request->start_time || !$request->end_time) {
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
                    if (!$value || !$request->start_time || !$request->end_time) {
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
                    if (!$request->start_time || !$request->end_time) {
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

    public function destroy(ChessClass $class)
    {
        $class->delete();

        return redirect()->back()->with('success', 'Class deleted successfully.');
    }

    public function show(ChessClass $class): Response
    {
        $class->load(['coach', 'package', 'students', 'room']);

        return Inertia::render('Admin/Classes/Show', [
            'chessClass' => $class,
            'allClasses' => ChessClass::select('id', 'name', 'uid')->orderBy('name')->get(),
            'availableStudents' => Student::whereDoesntHave('classes', function ($q) use ($class) {
                $q->where('class_id', $class->id);
            })->orderBy('name')->get(['id', 'name', 'student_uid']),
        ]);
    }
}
