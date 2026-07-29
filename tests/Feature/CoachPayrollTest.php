<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Attendance;
use App\Models\ChessClass;
use App\Models\Package;
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

    public function test_coach_can_view_own_payrolls(): void
    {
        $coach = User::factory()->create(['role' => UserRole::Coach]);

        Payroll::create([
            'coach_id' => $coach->id,
            'month_year' => '2023-01',
            'total_sessions' => 5,
            'base_rate' => 80,
            'total_amount' => 400,
            'status' => 'Paid',
        ]);

        $response = $this->actingAs($coach)->get(route('coach.payrolls.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Coach/Payrolls/Index')
            ->has('payrolls', 1)
            ->where('payrolls.0.total_amount', '400.00')
        );
    }

    public function test_generates_payroll_for_coach_using_package_rate(): void
    {
        // 1. Create Package with coach rate
        $package = Package::factory()->create([
            'coach_rate_per_session' => 80.00,
        ]);

        // 2. Create Coach (no individual hourly_rate needed anymore)
        $coach = User::factory()->create([
            'role' => UserRole::Coach,
        ]);

        // 3. Create Class linked to coach and package
        $class = ChessClass::factory()->create([
            'coach_id' => $coach->id,
            'package_id' => $package->id,
            'schedules' => [],
        ]);

        $student = Student::factory()->create();

        // 4. Create attendance records (2 delivered sessions in last month)
        $lastMonth = Carbon::now()->subMonth()->format('Y-m');
        $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth();

        $date1 = $startOfLastMonth->copy()->addDays(1)->format('Y-m-d');
        Attendance::create([
            'class_id' => $class->id,
            'attendance_date' => $date1,
            'student_id' => $student->id,
            'is_present' => true,
        ]);

        $date2 = $startOfLastMonth->copy()->addDays(2)->format('Y-m-d');
        Attendance::create([
            'class_id' => $class->id,
            'attendance_date' => $date2,
            'student_id' => $student->id,
            'is_present' => true,
        ]);

        // A future session — should be ignored
        $futureDate = Carbon::now()->addDays(1)->format('Y-m-d');
        Attendance::create([
            'class_id' => $class->id,
            'attendance_date' => $futureDate,
            'student_id' => $student->id,
            'is_present' => true,
        ]);

        // 5. Run Command
        $this->artisan('payroll:generate-monthly', ['month' => $lastMonth])
            ->assertExitCode(0);

        // 6. Assert Payroll: 2 sessions × RM80 = RM160
        $this->assertDatabaseHas('payrolls', [
            'coach_id' => $coach->id,
            'month_year' => $lastMonth,
            'total_sessions' => 2,
            'total_amount' => 160.00, // 2 × 80
            'status' => 'Draft',
        ]);
    }

    public function test_does_not_generate_payroll_for_coach_without_sessions(): void
    {
        $coach = User::factory()->create([
            'role' => UserRole::Coach,
        ]);

        $lastMonth = Carbon::now()->subMonth()->format('Y-m');

        $this->artisan('payroll:generate-monthly', ['month' => $lastMonth])
            ->assertExitCode(0);

        $this->assertDatabaseMissing('payrolls', [
            'coach_id' => $coach->id,
            'month_year' => $lastMonth,
        ]);
    }

    public function test_admin_can_approve_payroll(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $payroll = Payroll::create([
            'coach_id' => User::factory()->create(['role' => UserRole::Coach])->id,
            'month_year' => '2024-01',
            'total_sessions' => 4,
            'base_rate' => 80,
            'total_amount' => 320,
            'status' => 'Draft',
        ]);

        $response = $this->actingAs($admin)->put(route('admin.payrolls.approve', $payroll->id));

        $response->assertRedirect();
        $this->assertDatabaseHas('payrolls', [
            'id' => $payroll->id,
            'status' => 'Processed',
        ]);
    }

    public function test_admin_can_mark_payroll_as_paid(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $payroll = Payroll::create([
            'coach_id' => User::factory()->create(['role' => UserRole::Coach])->id,
            'month_year' => '2024-01',
            'total_sessions' => 4,
            'base_rate' => 80,
            'total_amount' => 320,
            'status' => 'Processed',
        ]);

        $response = $this->actingAs($admin)->put(route('admin.payrolls.paid', $payroll->id));

        $response->assertRedirect();
        $this->assertDatabaseHas('payrolls', [
            'id' => $payroll->id,
            'status' => 'Paid',
        ]);
    }
}
