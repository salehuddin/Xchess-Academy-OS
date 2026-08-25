<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payroll;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class PayrollController extends Controller
{
    public function index(Request $request): Response
    {
        $monthFilter = $request->input('month');
        $statusFilter = $request->input('status');

        $query = Payroll::with(['coach.coachProfile'])
            ->orderBy('month_year', 'desc')
            ->orderBy('total_amount', 'desc');

        if ($monthFilter) {
            $query->where('month_year', $monthFilter);
        }

        if ($statusFilter) {
            $query->where('status', $statusFilter);
        }

        $payrolls = $query->get();

        // Summary stats for the current filtered set
        $summary = [
            'total_payroll' => $payrolls->sum('total_amount'),
            'total_sessions' => $payrolls->sum('total_sessions'),
            'draft_count' => $payrolls->where('status', 'Draft')->count(),
            'processed_count' => $payrolls->where('status', 'Processed')->count(),
            'paid_count' => $payrolls->where('status', 'Paid')->count(),
            'paid_amount' => $payrolls->where('status', 'Paid')->sum('total_amount'),
        ];

        // Available months for the filter dropdown
        $availableMonths = Payroll::select('month_year')
            ->distinct()
            ->orderBy('month_year', 'desc')
            ->pluck('month_year');

        return Inertia::render('Admin/Payrolls/Index', [
            'payrolls' => $payrolls,
            'summary' => $summary,
            'availableMonths' => $availableMonths,
            'filters' => $request->only(['month', 'status']),
        ]);
    }

    public function show(Payroll $payroll): JsonResponse
    {
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

    public function update(Request $request, Payroll $payroll): JsonResponse
    {
        if ($payroll->status !== 'Draft') {
            abort(403, 'Only Draft payrolls can be edited.');
        }

        $validated = $request->validate([
            'total_sessions' => 'required|integer|min:0',
            'base_rate' => 'required|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
        ]);

        $before = $payroll->only(['total_sessions', 'base_rate', 'total_amount']);

        $payroll->update($validated);

        activity('payroll')
            ->performedOn($payroll)
            ->causedBy(auth()->user())
            ->withProperties(['before' => $before, 'after' => $validated])
            ->log('Payroll updated');

        return response()->json([
            'message' => 'Payroll updated.',
            'payroll' => $payroll->fresh(),
        ]);
    }

    public function approve(Payroll $payroll): RedirectResponse
    {
        $payroll->update(['status' => 'Processed']);

        activity('payroll')
            ->performedOn($payroll)
            ->causedBy(auth()->user())
            ->withProperties(['from' => 'Draft', 'to' => 'Processed'])
            ->log('Payroll marked as Processed');

        return redirect()->back()->with('success', 'Payroll marked as processed.');
    }

    public function markPaid(Payroll $payroll): RedirectResponse
    {
        $payroll->update(['status' => 'Paid']);

        activity('payroll')
            ->performedOn($payroll)
            ->causedBy(auth()->user())
            ->withProperties(['from' => 'Processed', 'to' => 'Paid'])
            ->log('Payroll marked as Paid');

        return redirect()->back()->with('success', 'Payroll marked as paid.');
    }
}
