<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payroll;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index()
    {
        // 1. Calculate Total Revenue (Paid Invoices)
        $totalRevenue = (float) Invoice::where('status', 'Paid')->sum('total_amount');

        // 2. Calculate Total Expenses (Paid Payrolls)
        $totalExpenses = (float) Payroll::where('status', 'Paid')->sum('total_amount');

        // 3. Get Monthly Breakdown (Last 12 months)
        $monthlyStats = $this->getMonthlyStats();

        return Inertia::render('Admin/Reports/Index', [
            'totalRevenue' => $totalRevenue,
            'totalExpenses' => $totalExpenses,
            'netIncome' => $totalRevenue - $totalExpenses,
            'monthlyStats' => $monthlyStats,
        ]);
    }

    private function getMonthlyStats()
    {
        // This is a simplified approach. For production, consider using a dedicated analytics package or more complex SQL.

        // Get all unique months from both tables
        $months = collect();

        $invoiceMonths = Invoice::where('status', 'Paid')
            ->select('month_year')
            ->distinct()
            ->pluck('month_year');

        $payrollMonths = Payroll::where('status', 'Paid')
            ->select('month_year')
            ->distinct()
            ->pluck('month_year');

        $months = $months->merge($invoiceMonths)->merge($payrollMonths)->unique()->sort()->values();

        $stats = $months->map(function ($month) {
            $revenue = (float) Invoice::where('status', 'Paid')
                ->where('month_year', $month)
                ->sum('total_amount');

            $expenses = (float) Payroll::where('status', 'Paid')
                ->where('month_year', $month)
                ->sum('total_amount');

            return [
                'month' => $month,
                'revenue' => $revenue,
                'expenses' => $expenses,
                'net' => $revenue - $expenses,
            ];
        });

        return $stats;
    }
}
