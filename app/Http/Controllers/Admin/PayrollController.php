<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payroll;
use Inertia\Inertia;

class PayrollController extends Controller
{
    public function index()
    {
        $payrolls = Payroll::with('coach')
            ->orderBy('month_year', 'desc')
            ->get();

        return Inertia::render('Admin/Payrolls/Index', [
            'payrolls' => $payrolls,
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
