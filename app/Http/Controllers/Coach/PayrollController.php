<?php

namespace App\Http\Controllers\Coach;

use App\Http\Controllers\Controller;
use App\Models\Payroll;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

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
}
