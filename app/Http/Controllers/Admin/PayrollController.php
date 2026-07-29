<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payroll;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

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

    public function approve(Payroll $payroll)
    {
        $payroll->update(['status' => 'Processed']);

        return redirect()->back()->with('success', 'Payroll marked as processed.');
    }

    public function markPaid(Payroll $payroll)
    {
        $payroll->update(['status' => 'Paid']);

        return redirect()->back()->with('success', 'Payroll marked as paid.');
    }
}
