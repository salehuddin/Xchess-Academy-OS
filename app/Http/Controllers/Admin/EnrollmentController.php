<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChessClass;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function store(Request $request, ChessClass $class)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
        ]);

        $class->students()->attach($request->student_id);

        return redirect()->back()->with('success', 'Student enrolled successfully.');
    }

    public function destroy(ChessClass $class, $studentId)
    {
        $class->students()->detach($studentId);

        return redirect()->back()->with('success', 'Student removed from class.');
    }
}
