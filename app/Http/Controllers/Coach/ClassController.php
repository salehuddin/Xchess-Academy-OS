<?php

namespace App\Http\Controllers\Coach;

use App\Http\Controllers\Controller;
use App\Models\ChessClass;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ClassController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $targetCoachId = $user->id;
        if ($user->isAdmin() && $request->has('coach_id')) {
            $targetCoachId = $request->query('coach_id');
        }

        // Only show classes where this coach is the default class coach
        $classes = ChessClass::with(['room', 'package'])
            ->withCount('students')
            ->where('coach_id', $targetCoachId)
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $impersonatedCoach = null;
        if ($user->isAdmin() && $request->has('coach_id')) {
            $impersonatedCoach = User::find($targetCoachId);
        }

        return Inertia::render('Coach/Classes/Index', [
            'classes' => $classes,
            'impersonatedCoach' => $impersonatedCoach,
        ]);
    }

    public function show(Request $request, ChessClass $class): Response
    {
        $user = Auth::user();

        $targetCoachId = $user->id;
        if ($user->isAdmin() && $request->has('coach_id')) {
            $targetCoachId = $request->query('coach_id');
        }

        if ($class->coach_id !== (int) $targetCoachId && ! $user->isAdmin()) {
            abort(403, 'Unauthorized action.');
        }

        $class->load(['room', 'package', 'students']);

        $impersonatedCoach = null;
        if ($user->isAdmin() && $request->has('coach_id')) {
            $impersonatedCoach = User::find($targetCoachId);
        }

        return Inertia::render('Coach/Classes/Show', [
            'chessClass' => $class,
            'impersonatedCoach' => $impersonatedCoach,
        ]);
    }
}
