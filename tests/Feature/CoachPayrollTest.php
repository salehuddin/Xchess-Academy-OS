<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Attendance;
use App\Models\ChessClass;
use App\Models\Payroll;
use App\Models\Student;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CoachPayrollTest extends TestCase
{
    use RefreshDatabase;

    public function test_coach_can_view_own_payrolls()
    {
        $coach = User::factory()->create(['role' => UserRole::Coach]);

        Payroll::create([
            'coach_id' => $coach->id,
            'month_year' => '2023-01',
            'total_sessions' => 5,
            'base_rate' => 10,
            'total_amount' => 50,
            'status' => 'Paid',
        ]);

        $response = $this->actingAs($coach)->get(route('coach.payrolls.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Coach/Payrolls/Index')
            ->has('payrolls', 1)
            ->where('payrolls.0.total_amount', '50.00')
        );
    }

    public function test_generates_payroll_for_coach_with_delivered_sessions()
    {
        // 1. Create Coach
        $coach = User::factory()->create([
            'role' => UserRole::Coach,
            'hourly_rate' => 50.00,
        ]);

        // 2. Create Class
        $class = ChessClass::factory()->create([
            'coach_id' => $coach->id,
            'schedules' => [],
        ]);

        $student = Student::factory()->create();

        // 3. Create Sessions (2 delivered in last month, 1 future, 1 undelivered)
        $lastMonth = Carbon::now()->subMonth()->format('Y-m');
        $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth();

        // Delivered Session 1 (Attendance exists)
        $date1 = $startOfLastMonth->copy()->addDays(1)->format('Y-m-d');
        Attendance::create([
            'class_id' => $class->id,
            'attendance_date' => $date1,
            'student_id' => $student->id,
            'is_present' => true,
        ]);

        // Delivered Session 2 (Attendance exists)
        $date2 = $startOfLastMonth->copy()->addDays(2)->format('Y-m-d');
        Attendance::create([
            'class_id' => $class->id,
            'attendance_date' => $date2,
            'student_id' => $student->id,
            'is_present' => true,
        ]);

        // Future Session (should be ignored by date filter)
        $futureDate = Carbon::now()->addDays(1)->format('Y-m-d');
        Attendance::create([
            'class_id' => $class->id,
            'attendance_date' => $futureDate,
            'student_id' => $student->id,
            'is_present' => true,
        ]);

        // 4. Run Command
        $this->artisan('payroll:generate-monthly', ['month' => $lastMonth])
            ->assertExitCode(0);

        // 5. Assert Payroll Created
        $this->assertDatabaseHas('payrolls', [
            'coach_id' => $coach->id,
            'month_year' => $lastMonth,
            'total_sessions' => 2,
            'base_rate' => 50.00,
            'total_amount' => 100.00, // 2 * 50
            'status' => 'Draft',
        ]);
    }

    public function test_does_not_generate_payroll_for_coach_without_sessions()
    {
        $coach = User::factory()->create([
            'role' => UserRole::Coach,
            'hourly_rate' => 50.00,
        ]);

        $lastMonth = Carbon::now()->subMonth()->format('Y-m');

        $this->artisan('payroll:generate-monthly', ['month' => $lastMonth])
            ->assertExitCode(0);

        $this->assertDatabaseMissing('payrolls', [
            'coach_id' => $coach->id,
            'month_year' => $lastMonth,
        ]);
    }
}
