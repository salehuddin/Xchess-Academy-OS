<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\ChessClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private ChessClass $chessClass;

    private Student $student;

    private string $date;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $this->date = now()->format('Y-m-d');

        $this->chessClass = ChessClass::factory()->create([
            'schedules' => [$this->date],
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
        ]);

        $this->student = Student::factory()->create();

        // Enroll student
        $this->chessClass->students()->attach($this->student);
    }

    public function test_can_view_attendance_index()
    {
        $response = $this->actingAs($this->admin)->get(route('admin.attendances.index', ['date' => $this->date]));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Attendance/Index')
            ->has('schedules.data', 1)
        );
    }

    public function test_can_filter_attendances_by_date_range()
    {
        // Create another class on a different date
        $futureDate = now()->addDays(10)->format('Y-m-d');
        ChessClass::factory()->create([
            'schedules' => [$futureDate],
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
        ]);

        // Filter for today only
        $response = $this->actingAs($this->admin)->get(route('admin.attendances.index', [
            'start_date' => $this->date,
            'end_date' => $this->date,
        ]));

        $response->assertInertia(fn ($page) => $page
            ->has('schedules.data', 1)
            ->where('schedules.data.0.date', $this->date)
        );

        // Filter for future date only
        $response = $this->actingAs($this->admin)->get(route('admin.attendances.index', [
            'start_date' => $futureDate,
            'end_date' => $futureDate,
        ]));

        $response->assertInertia(fn ($page) => $page
            ->has('schedules.data', 1)
            ->where('schedules.data.0.date', $futureDate)
        );
    }

    public function test_can_filter_attendances_by_class()
    {
        // Create another class for today
        $otherClass = ChessClass::factory()->create([
            'schedules' => [$this->date],
            'start_time' => '12:00:00',
            'end_time' => '13:00:00',
        ]);

        // Filter for the first class
        $response = $this->actingAs($this->admin)->get(route('admin.attendances.index', [
            'class_id' => $this->chessClass->id,
            'start_date' => $this->date,
            'end_date' => $this->date,
        ]));

        $response->assertInertia(fn ($page) => $page
            ->has('schedules.data', 1)
            ->where('schedules.data.0.id', $this->chessClass->id)
        );

        // Filter for the other class
        $response = $this->actingAs($this->admin)->get(route('admin.attendances.index', [
            'class_id' => $otherClass->id,
            'start_date' => $this->date,
            'end_date' => $this->date,
        ]));

        $response->assertInertia(fn ($page) => $page
            ->has('schedules.data', 1)
            ->where('schedules.data.0.id', $otherClass->id)
        );
    }

    public function test_can_filter_attendances_by_coach()
    {
        $coach1 = User::factory()->create(['role' => UserRole::Coach->value]);
        $coach2 = User::factory()->create(['role' => UserRole::Coach->value]);

        // Update existing class to have coach1
        $this->chessClass->update(['coach_id' => $coach1->id]);

        // Create another class for today with coach2
        $otherClass = ChessClass::factory()->create([
            'schedules' => [$this->date],
            'start_time' => '12:00:00',
            'end_time' => '13:00:00',
            'coach_id' => $coach2->id,
        ]);

        // Filter for coach1
        $response = $this->actingAs($this->admin)->get(route('admin.attendances.index', [
            'coach_id' => $coach1->id,
            'start_date' => $this->date,
            'end_date' => $this->date,
        ]));

        $response->assertInertia(fn ($page) => $page
            ->has('schedules.data', 1)
            ->where('schedules.data.0.id', $this->chessClass->id)
        );

        // Filter for coach2
        $response = $this->actingAs($this->admin)->get(route('admin.attendances.index', [
            'coach_id' => $coach2->id,
            'start_date' => $this->date,
            'end_date' => $this->date,
        ]));

        $response->assertInertia(fn ($page) => $page
            ->has('schedules.data', 1)
            ->where('schedules.data.0.id', $otherClass->id)
        );
    }

    public function test_can_view_attendance_show_page()
    {
        $response = $this->actingAs($this->admin)->get(route('admin.attendances.show', [
            'class' => $this->chessClass->id,
            'date' => $this->date,
        ]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Attendance/Show')
            ->has('students', 1)
        );
    }

    public function test_can_store_attendance()
    {
        $response = $this->actingAs($this->admin)
            ->from(route('admin.attendances.index', ['date' => $this->date]))
            ->post(route('admin.attendances.store', [
                'class' => $this->chessClass->id,
                'date' => $this->date,
            ]), [
                'attendances' => [
                    [
                        'student_id' => $this->student->id,
                        'is_present' => true,
                    ],
                ],
                'topic' => 'Opening Principles',
                'notes' => 'Focus on center control',
                'coach_id' => null,
            ]);

        $response->assertRedirect(route('admin.attendances.index', ['date' => $this->date]));

        $this->assertDatabaseHas('attendances', [
            'class_id' => $this->chessClass->id,
            'attendance_date' => $this->date,
            'student_id' => $this->student->id,
            'is_present' => true,
        ]);

        $this->assertDatabaseHas('class_sessions', [
            'class_id' => $this->chessClass->id,
            'session_date' => $this->date,
            'topic' => 'Opening Principles',
            'notes' => 'Focus on center control',
        ]);
    }
}
