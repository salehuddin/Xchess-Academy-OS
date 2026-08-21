<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RoomController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Room::query()
            ->withCount('schedules');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('platform', 'like', "%{$search}%")
                    ->orWhere('account_email', 'like', "%{$search}%")
                    ->orWhere('mode', 'like', "%{$search}%");
            });
        }

        if ($request->has('sort')) {
            $query->orderBy($request->sort, $request->direction ?? 'asc');
        } else {
            $query->latest();
        }

        $perPage = (int) $request->input('per_page', 10);
        if (! in_array($perPage, [10, 25, 50, 100], true)) {
            $perPage = 10;
        }

        $rooms = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Admin/Rooms/Index', [
            'rooms' => $rooms,
            'filters' => $request->only(['search', 'sort', 'direction', 'per_page']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $mode = $request->input('mode');
        $platformLabel = match ($request->input('platform')) {
            'zoom' => 'Zoom',
            'google_meet' => 'Google Meet',
            default => 'platform',
        };

        $rules = [
            'name' => 'required|string|max:255|unique:rooms',
            'capacity' => ['nullable', 'integer', 'min:1'],
            'mode' => ['required', Rule::in(['physical', 'online'])],
            'location' => ['nullable', 'string', 'max:255'],
            'platform' => ['nullable', Rule::in(['zoom', 'google_meet'])],
            'account_email' => ['nullable', 'email', 'max:255'],
        ];

        if ($mode === 'online') {
            $rules['platform'][] = 'required';
            $rules['account_email'][] = 'required';
            $rules['account_email'][] = function ($attribute, $value, $fail) use ($request, $platformLabel) {
                $exists = Room::where('account_email', $value)
                    ->where('platform', $request->input('platform'))
                    ->exists();
                if ($exists) {
                    $fail("This {$platformLabel} account already assigned to a Room");
                }
            };
        } else {
            $rules['location'][] = 'required';
            $rules['location'][] = Rule::in(['Kota Bharu', 'Melaka Tengah']);
        }

        $validated = Validator::make($request->all(), $rules)->validate();

        // Default capacity if not provided
        $validated['capacity'] = $validated['capacity'] ?? 20;

        if ($validated['mode'] === 'online') {
            $validated['location'] = null;
        } else {
            $validated['platform'] = null;
            $validated['account_email'] = null;
        }

        Room::create($validated);

        return redirect()->back()->with('success', 'Room created successfully.');
    }

    public function schedule(Room $room): Response
    {
        $room->load(['classes' => function ($query) {
            $query->select('id', 'uid', 'name', 'room_id', 'day', 'start_time', 'end_time', 'package_id', 'coach_id')
                ->with(['package:id,title', 'coach:id,name'])
                ->where('status', '!=', 'Stopped'); // Only show active/pending classes
        }]);

        return Inertia::render('Admin/Rooms/Schedule', [
            'room' => $room,
            'classes' => $room->classes,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Room $room)
    {
        $mode = $request->input('mode');
        $platformLabel = match ($request->input('platform')) {
            'zoom' => 'Zoom',
            'google_meet' => 'Google Meet',
            default => 'platform',
        };

        $rules = [
            'name' => 'required|string|max:255|unique:rooms,name,'.$room->id,
            'capacity' => ['nullable', 'integer', 'min:1'],
            'mode' => ['required', Rule::in(['physical', 'online'])],
            'location' => ['nullable', 'string', 'max:255'],
            'platform' => ['nullable', Rule::in(['zoom', 'google_meet'])],
            'account_email' => ['nullable', 'email', 'max:255'],
        ];

        if ($mode === 'online') {
            $rules['platform'][] = 'required';
            $rules['account_email'][] = 'required';
            $rules['account_email'][] = function ($attribute, $value, $fail) use ($request, $platformLabel, $room) {
                $exists = Room::where('account_email', $value)
                    ->where('platform', $request->input('platform'))
                    ->where('id', '!=', $room->id)
                    ->exists();
                if ($exists) {
                    $fail("This {$platformLabel} account already assigned to a Room");
                }
            };
        } else {
            $rules['location'][] = 'required';
            $rules['location'][] = Rule::in(['Kota Bharu', 'Melaka Tengah']);
        }

        $validated = Validator::make($request->all(), $rules)->validate();

        $validated['capacity'] = $validated['capacity'] ?? $room->capacity ?? 20;

        if ($validated['mode'] === 'online') {
            $validated['location'] = null;
        } else {
            $validated['platform'] = null;
            $validated['account_email'] = null;
        }

        $room->update($validated);

        return redirect()->back()->with('success', 'Room updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Room $room)
    {
        if ($room->schedules()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete room with existing schedules.');
        }

        $room->delete();

        return redirect()->back()->with('success', 'Room deleted successfully.');
    }
}
