<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\ChessClass;
use App\Models\Invoice;
use App\Models\Student;
use App\Models\UserNotification;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $stats = [];

        if ($user->role === UserRole::Admin) {
            $stats = [
                'total_students' => Student::count(),
                'total_classes' => ChessClass::count(),
                'pending_invoices' => Invoice::where('status', 'Pending')->count(),
                'monthly_revenue' => Invoice::where('status', 'Paid')
                    ->where('month_year', now()->format('Y-m'))
                    ->sum('total_amount'),
            ];

            return Inertia::render('Dashboard', [
                'stats' => $stats,
                'unreadNotifications' => $this->unreadNotifications($user),
            ]);
        } elseif ($user->role === UserRole::Coach) {
            return redirect()->route('coach.dashboard');
        }
    }

    private function unreadNotifications($user)
    {
        return UserNotification::query()
            ->where('user_id', $user->id)
            ->whereNull('read_at')
            ->latest()
            ->limit(8)
            ->get(['id', 'type', 'title', 'body', 'url', 'created_at']);
    }
}
