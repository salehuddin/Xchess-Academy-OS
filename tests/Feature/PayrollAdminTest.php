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
use Tests\TestCase;

class PayrollAdminTest extends TestCase
{
    use RefreshDatabase;

    private function makeDraftPayroll(array $overrides = []): Payroll
    {
        return Payroll::create(array_merge([
            'coach_id' => User::factory()->create(['role' => UserRole::Coach])->id,
            'month_year' => '2024-03',
            'total_sessions' => 4,
            'base_rate' => 80,
            'total_amount' => 320,
            'status' => 'Draft',
        ], $overrides));
    }

    public function test_generation_persists_session_line_items(): void
    {
        $package = Package::factory()->create(['coach_rate_per_session' => 80.00]);
        $coach = User::factory()->create(['role' => UserRole::Coach]);
        $class = ChessClass::factory()->create([
            'coach_id' => $coach->id,
            'package_id' => $package->id,
            'schedules' => [],
        ]);
        $student = Student::factory()->create();

        $lastMonth = Carbon::now()->subMonth()->format('Y-m');
        $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth();
        Attendance::create([
            'class_id' => $class->id,
            'attendance_date' => $startOfLastMonth->copy()->addDays(1)->format('Y-m-d'),
            'student_id' => $student->id,
            'is_present' => true,
        ]);

        $this->artisan('payroll:generate-monthly', ['month' => $lastMonth])->assertExitCode(0);

        $payroll = Payroll::where('coach_id', $coach->id)->first();
        $this->assertNotNull($payroll);
        $this->assertDatabaseHas('payroll_line_items', [
            'payroll_id' => $payroll->id,
            'class_id' => $class->id,
            'rate' => 80.00,
        ]);
        $this->assertDatabaseHas('activity_log', [
            'subject_type' => Payroll::class,
            'subject_id' => $payroll->id,
            'log_name' => 'payroll',
        ]);
    }

    public function test_regeneration_preserves_existing_status(): void
    {
        $package = Package::factory()->create(['coach_rate_per_session' => 80.00]);
        $coach = User::factory()->create(['role' => UserRole::Coach]);
        $class = ChessClass::factory()->create([
            'coach_id' => $coach->id,
            'package_id' => $package->id,
            'schedules' => [],
        ]);
        $student = Student::factory()->create();

        $lastMonth = Carbon::now()->subMonth()->format('Y-m');
        $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth();
        Attendance::create([
            'class_id' => $class->id,
            'attendance_date' => $startOfLastMonth->copy()->addDays(1)->format('Y-m-d'),
            'student_id' => $student->id,
            'is_present' => true,
        ]);

        // First run creates a Draft payroll.
        $this->artisan('payroll:generate-monthly', ['month' => $lastMonth])->assertExitCode(0);
        $payroll = Payroll::where('coach_id', $coach->id)->first();
        $payroll->update(['status' => 'Processed']);

        // Re-running must recompute amounts/line items but NOT reset the status.
        $this->artisan('payroll:generate-monthly', ['month' => $lastMonth])->assertExitCode(0);

        $payroll->refresh();
        $this->assertSame('Processed', $payroll->status);
        $this->assertDatabaseHas('activity_log', [
            'subject_type' => Payroll::class,
            'subject_id' => $payroll->id,
            'log_name' => 'payroll',
            'description' => "Payroll regenerated for {$lastMonth}: 1 sessions, RM 80",
        ]);
    }

    public function test_admin_can_view_payroll_detail(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $payroll = $this->makeDraftPayroll();
        $payroll->lineItems()->create([
            'class_id' => null,
            'class_name' => 'Beginner Class',
            'package_title' => 'Monthly',
            'attendance_date' => '2024-03-01',
            'rate' => 80,
        ]);

        $response = $this->actingAs($admin)->getJson(route('admin.payrolls.show', $payroll->id));

        $response->assertStatus(200)
            ->assertJsonPath('payroll.id', $payroll->id)
            ->assertJsonCount(1, 'line_items')
            ->assertJsonPath('line_items.0.class_name', 'Beginner Class')
            ->assertJsonPath('line_items.0.attendance_date', '2024-03-01');
    }

    public function test_coach_can_view_own_payroll_detail(): void
    {
        $coach = User::factory()->create(['role' => UserRole::Coach]);
        $payroll = Payroll::create([
            'coach_id' => $coach->id,
            'month_year' => '2024-03',
            'total_sessions' => 4,
            'base_rate' => 80,
            'total_amount' => 320,
            'status' => 'Draft',
        ]);

        $response = $this->actingAs($coach)->getJson(route('coach.payrolls.show', $payroll->id));

        $response->assertStatus(200)
            ->assertJsonPath('payroll.id', $payroll->id);
    }

    public function test_admin_can_update_draft_payroll(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $payroll = $this->makeDraftPayroll();

        // Send values as strings, mirroring the modal form inputs.
        $response = $this->actingAs($admin)->putJson(route('admin.payrolls.update', $payroll->id), [
            'total_sessions' => '6',
            'base_rate' => '90',
            'total_amount' => '540',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('payrolls', [
            'id' => $payroll->id,
            'total_sessions' => 6,
            'base_rate' => 90.00,
            'total_amount' => 540.00,
        ]);
        $this->assertDatabaseHas('activity_log', [
            'subject_type' => Payroll::class,
            'subject_id' => $payroll->id,
            'log_name' => 'payroll',
            'causer_id' => $admin->id,
        ]);

        // The update appears in the detail trail with before/after values.
        $detail = $this->actingAs($admin)->getJson(route('admin.payrolls.show', $payroll->id));
        $detail->assertStatus(200)
            ->assertJsonPath('activities.0.description', 'Payroll updated')
            ->assertJsonPath('activities.0.properties.before.total_amount', '320.00')
            ->assertJsonPath('activities.0.properties.after.total_amount', '540');
    }

    public function test_admin_cannot_update_processed_payroll(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $payroll = $this->makeDraftPayroll(['status' => 'Processed']);

        $response = $this->actingAs($admin)->putJson(route('admin.payrolls.update', $payroll->id), [
            'total_sessions' => 6,
            'base_rate' => 90,
            'total_amount' => 540,
        ]);

        $response->assertStatus(403);
    }

    public function test_approve_and_mark_paid_log_activity(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $payroll = $this->makeDraftPayroll();

        $this->actingAs($admin)->put(route('admin.payrolls.approve', $payroll->id));
        $this->actingAs($admin)->put(route('admin.payrolls.paid', $payroll->id));

        $this->assertDatabaseHas('activity_log', [
            'subject_type' => Payroll::class,
            'subject_id' => $payroll->id,
            'log_name' => 'payroll',
            'description' => 'Payroll marked as Paid',
        ]);
    }

    public function test_coach_cannot_view_another_coach_payroll(): void
    {
        $coach = User::factory()->create(['role' => UserRole::Coach]);
        $otherCoach = User::factory()->create(['role' => UserRole::Coach]);
        $payroll = Payroll::create([
            'coach_id' => $otherCoach->id,
            'month_year' => '2024-03',
            'total_sessions' => 4,
            'base_rate' => 80,
            'total_amount' => 320,
            'status' => 'Draft',
        ]);

        $response = $this->actingAs($coach)->getJson(route('coach.payrolls.show', $payroll->id));

        $response->assertStatus(403);
    }
}
