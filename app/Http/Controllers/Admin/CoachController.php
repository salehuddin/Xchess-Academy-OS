<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\ChessClass;
use App\Models\CoachProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CoachController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::with('coachProfile')->coaches();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('coachProfile', function ($q) use ($search) {
                        $q->where('phone', 'like', "%{$search}%")
                            ->orWhere('nric', 'like', "%{$search}%");
                    });
            });
        }

        $perPage = (int) $request->input('per_page', 10);
        if (! in_array($perPage, [10, 25, 50, 100], true)) {
            $perPage = 10;
        }

        $coaches = $query->latest()->paginate($perPage)->withQueryString();

        return Inertia::render('Admin/Coaches/Index', [
            'coaches' => $coaches,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Coaches/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'nric' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'bank_name' => 'nullable|string|max:255',
            'bank_account_name' => 'nullable|string|max:255',
            'bank_account_number' => 'nullable|string|max:50',
            'level' => 'nullable|string|max:50',
            'hourly_rate' => 'nullable|numeric|min:0',
            'availability' => 'nullable|array',
        ]);

        DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => UserRole::Coach,
            ]);

            CoachProfile::create([
                'user_id' => $user->id,
                'nric' => $validated['nric'],
                'phone' => $validated['phone'],
                'bank_name' => $validated['bank_name'],
                'bank_account_name' => $validated['bank_account_name'],
                'bank_account_number' => $validated['bank_account_number'],
                'level' => $validated['level'],
                'hourly_rate' => $validated['hourly_rate'] ?? 0,
                'availability' => $validated['availability'],
            ]);
        });

        return redirect()->route('admin.coaches.index')->with('success', 'Coach created successfully.');
    }

    public function edit(User $coach): Response
    {
        $coach->load('coachProfile');

        // Ensure this user is actually a coach or has a profile
        if (! $coach->coachProfile && $coach->role !== UserRole::Coach) {
            abort(404);
        }

        return Inertia::render('Admin/Coaches/Edit', [
            'coach' => $coach,
        ]);
    }

    public function show(User $coach): Response
    {
        $coach->load('coachProfile');

        if (! $coach->coachProfile && $coach->role !== UserRole::Coach) {
            abort(404);
        }

        $classes = ChessClass::with(['package', 'room'])
            ->where('coach_id', $coach->id)
            ->orderByDesc('id')
            ->get()
            ->map(fn ($class) => [
                'id' => $class->id,
                'name' => $class->name,
                'package' => $class->package?->title,
                'day' => $class->day,
                'start_time' => $class->start_time ? Carbon::parse($class->start_time)->format('H:i') : null,
                'end_time' => $class->end_time ? Carbon::parse($class->end_time)->format('H:i') : null,
                'room' => $class->room?->name,
                'mode' => $class->mode,
                'status' => $class->status,
            ]);

        $attendances = Attendance::with(['student', 'class.package', 'class.room'])
            ->whereHas('class', fn ($q) => $q->where('coach_id', $coach->id))
            ->orderByDesc('id')
            ->take(100)
            ->get()
            ->map(fn ($attendance) => [
                'id' => $attendance->id,
                'student' => $attendance->student?->name,
                'student_id' => $attendance->student_id,
                'is_present' => $attendance->is_present,
                'class_name' => $attendance->class?->package?->title ?? $attendance->class?->name ?? 'Class',
                'room_name' => $attendance->class?->room?->name,
                'date' => $attendance->attendance_date?->format('Y-m-d'),
                'start_time' => $attendance->class?->start_time ? Carbon::parse($attendance->class->start_time)->format('H:i') : null,
                'end_time' => $attendance->class?->end_time ? Carbon::parse($attendance->class->end_time)->format('H:i') : null,
                'is_delivered' => true,
            ]);

        $coachOptions = User::with('coachProfile')
            ->withCount('classes')
            ->where(function ($q) {
                $q->where('role', UserRole::Coach->value)
                    ->orWhereHas('coachProfile');
            })
            ->orderBy('name')
            ->get()
            ->map(fn ($option) => [
                'id' => $option->id,
                'name' => $option->name,
                'level' => $option->coachProfile?->level,
                'classes_count' => $option->classes_count,
            ]);

        return Inertia::render('Admin/Coaches/Show', [
            'coach' => $coach,
            'classes' => $classes,
            'attendances' => $attendances,
            'coachOptions' => $coachOptions,
        ]);
    }

    public function update(Request $request, User $coach)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($coach->id)],
            'nric' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'bank_name' => 'nullable|string|max:255',
            'bank_account_name' => 'nullable|string|max:255',
            'bank_account_number' => 'nullable|string|max:50',
            'level' => 'nullable|string|max:50',
            'hourly_rate' => 'nullable|numeric|min:0',
            'availability' => 'nullable|array',
        ]);

        DB::transaction(function () use ($coach, $validated) {
            $coach->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
            ]);

            $coach->coachProfile()->updateOrCreate(
                ['user_id' => $coach->id],
                [
                    'nric' => $validated['nric'],
                    'phone' => $validated['phone'],
                    'bank_name' => $validated['bank_name'],
                    'bank_account_name' => $validated['bank_account_name'],
                    'bank_account_number' => $validated['bank_account_number'],
                    'level' => $validated['level'],
                    'hourly_rate' => $validated['hourly_rate'] ?? 0,
                    'availability' => $validated['availability'],
                ]
            );
        });

        return redirect()->route('admin.coaches.index')->with('success', 'Coach updated successfully.');
    }

    public function destroy(User $coach)
    {
        $coach->delete();

        return redirect()->back()->with('success', 'Coach deleted successfully.');
    }
}
