<?php

namespace App\Http\Controllers\Coach;

use App\Http\Controllers\Controller;
use App\Models\ChessClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $targetCoachId = $user->id;
        if ($user->isAdmin() && $request->has('coach_id')) {
            $targetCoachId = $request->query('coach_id');
        }

        // Get all class IDs this coach is assigned to
        $classIds = ChessClass::where('coach_id', $targetCoachId)->pluck('id');

        // Fetch students enrolled in those classes
        $students = Student::whereHas('classes', function ($q) use ($classIds) {
            $q->whereIn('class_id', $classIds);
        })
            ->with(['classes' => function ($q) use ($classIds) {
                $q->whereIn('class_id', $classIds);
            }])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('student_uid', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $impersonatedCoach = null;
        if ($user->isAdmin() && $request->has('coach_id')) {
            $impersonatedCoach = User::find($targetCoachId);
        }

        return Inertia::render('Coach/Students/Index', [
            'students' => $students,
            'filters' => $request->only(['search']),
            'impersonatedCoach' => $impersonatedCoach,
        ]);
    }

    public function show(Request $request, Student $student): Response
    {
        $user = Auth::user();

        $targetCoachId = $user->id;
        if ($user->isAdmin() && $request->has('coach_id')) {
            $targetCoachId = $request->query('coach_id');
        }

        // Verify the student is in one of the coach's classes
        $classIds = ChessClass::where('coach_id', $targetCoachId)->pluck('id');

        $isEnrolled = $student->classes()->whereIn('class_id', $classIds)->exists();

        if (! $isEnrolled && ! $user->isAdmin()) {
            abort(403, 'Unauthorized action. This student is not in your classes.');
        }

        $student->load(['classes' => function ($q) use ($classIds) {
            $q->whereIn('class_id', $classIds)->with('room');
        }]);

        // Get attendance ONLY for classes this coach teaches
        $attendances = $student->attendances()
            ->with('class')
            ->whereIn('class_id', $classIds)
            ->orderByDesc('attendance_date')
            ->take(20)
            ->get();

        $impersonatedCoach = null;
        if ($user->isAdmin() && $request->has('coach_id')) {
            $impersonatedCoach = User::find($targetCoachId);
        }

        return Inertia::render('Coach/Students/Show', [
            'student' => $student,
            'attendances' => $attendances,
            'impersonatedCoach' => $impersonatedCoach,
        ]);
    }
}
