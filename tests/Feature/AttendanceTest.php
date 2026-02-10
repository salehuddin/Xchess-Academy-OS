<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\ChessClass;
use App\Models\ClassSchedule;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private ChessClass $chessClass;
    private ClassSchedule $schedule;
    private Student $student;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $this->chessClass = ChessClass::factory()->create();
        $this->student = Student::factory()->create();
        
        // Enroll student
        $this->chessClass->students()->attach($this->student);

        $this->schedule = ClassSchedule::factory()->create([
            'class_id' => $this->chessClass->id,
            'start_time' => now()->setHour(10)->setMinute(0),
            'end_time' => now()->setHour(11)->setMinute(0),
        ]);
    }

    public function test_can_view_attendance_index()
    {
        $response = $this->actingAs($this->admin)->get(route('admin.attendances.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Attendance/Index')
            ->has('schedules', 1)
        );
    }

    public function test_can_view_attendance_show_page()
    {
        $response = $this->actingAs($this->admin)->get(route('admin.attendances.show', $this->schedule));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Attendance/Show')
            ->has('students', 1)
        );
    }

    public function test_can_store_attendance()
    {
        $response = $this->actingAs($this->admin)->post(route('admin.attendances.store', $this->schedule), [
            'attendances' => [
                [
                    'student_id' => $this->student->id,
                    'is_present' => true,
                ]
            ]
        ]);

        $response->assertRedirect(route('admin.attendances.index', ['date' => $this->schedule->start_time->format('Y-m-d')]));
        $this->assertDatabaseHas('attendances', [
            'schedule_id' => $this->schedule->id,
            'student_id' => $this->student->id,
            'is_present' => true,
        ]);
        
        $this->assertDatabaseHas('class_schedules', [
            'id' => $this->schedule->id,
            'is_delivered' => true,
        ]);
    }
}
