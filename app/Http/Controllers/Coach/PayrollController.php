<?php

namespace App\Http\Controllers\Coach;

use App\Http\Controllers\Controller;
use App\Models\Payroll;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class PayrollController extends Controller
{
    public function index()
    {
        $payrolls = Payroll::where('coach_id', Auth::id())
            ->orderBy('month_year', 'desc')
            ->get();

        return Inertia::render('Coach/Payrolls/Index', [
            'payrolls' => $payrolls,
        ]);
    }

    public function show(Payroll $payroll): JsonResponse
    {
        if ($payroll->coach_id !== Auth::id()) {
            abort(403);
        }

        $payroll->load('coach.coachProfile', 'lineItems');

        $activities = Activity::query()
            ->where('subject_type', Payroll::class)
            ->where('subject_id', $payroll->id)
            ->with('causer')
            ->orderBy('created_at')
            ->get()
            ->map(fn ($activity) => [
                'id' => $activity->id,
                'description' => $activity->description,
                'causer_name' => $activity->causer?->name,
                'properties' => $activity->properties,
                'created_at' => $activity->created_at?->toISOString(),
            ]);

        return response()->json([
            'payroll' => $payroll,
            'line_items' => $payroll->lineItems,
            'activities' => $activities,
        ]);
    }
}
