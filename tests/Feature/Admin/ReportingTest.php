<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\Invoice;
use App\Models\Payroll;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ReportingTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_reports()
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);

        $response = $this->actingAs($admin)->get(route('admin.reports.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Reports/Index')
            ->has('totalRevenue')
            ->has('totalExpenses')
            ->has('netIncome')
            ->has('monthlyStats')
        );
    }

    public function test_reports_calculate_revenue_and_expenses_correctly()
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $student = Student::factory()->create();
        $coach = User::factory()->create(['role' => UserRole::Coach]);

        // Create Paid Invoices (Revenue)
        Invoice::factory()->create([
            'student_id' => $student->id,
            'total_amount' => 100,
            'status' => 'Paid',
            'month_year' => '2023-01'
        ]);
        Invoice::factory()->create([
            'student_id' => $student->id,
            'total_amount' => 50,
            'status' => 'Paid',
            'month_year' => '2023-01'
        ]);
        Invoice::factory()->create([
            'student_id' => $student->id,
            'total_amount' => 200,
            'status' => 'Pending', // Should be ignored
            'month_year' => '2023-01'
        ]);

        // Create Paid Payrolls (Expenses)
        Payroll::create([
            'coach_id' => $coach->id,
            'month_year' => '2023-01',
            'total_sessions' => 5,
            'base_rate' => 10,
            'total_amount' => 50,
            'status' => 'Paid'
        ]);
        Payroll::create([
            'coach_id' => $coach->id,
            'month_year' => '2023-01',
            'total_sessions' => 5,
            'base_rate' => 10,
            'total_amount' => 25,
            'status' => 'Processed' // Should be ignored
        ]);

        $response = $this->actingAs($admin)->get(route('admin.reports.index'));

        $response->assertInertia(fn (Assert $page) => $page
            ->where('totalRevenue', 150) // 100 + 50
            ->where('totalExpenses', 50)
            ->where('netIncome', 100) // 150 - 50
            ->has('monthlyStats', 1)
            ->where('monthlyStats.0.month', '2023-01')
            ->where('monthlyStats.0.revenue', 150)
            ->where('monthlyStats.0.expenses', 50)
            ->where('monthlyStats.0.net', 100)
        );
    }
}
