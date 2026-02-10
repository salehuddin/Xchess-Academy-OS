<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\ChessClass;
use App\Models\ClassSchedule;
use App\Models\Room;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScheduleTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        // Create an admin user
        $this->admin = User::factory()->create(['role' => UserRole::Admin]);
    }

    public function test_admin_can_create_schedule()
    {
        $room = Room::factory()->create();
        $class = ChessClass::factory()->create();
        $start = Carbon::now()->addDay()->setHour(10)->setMinute(0);
        $end = $start->copy()->addHour();

        $response = $this->actingAs($this->admin)->post(route('admin.schedules.store'), [
            'class_id' => $class->id,
            'room_id' => $room->id,
            'start_time' => $start->toDateTimeString(),
            'end_time' => $end->toDateTimeString(),
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('class_schedules', [
            'class_id' => $class->id,
            'room_id' => $room->id,
            'start_time' => $start->toDateTimeString(),
            'end_time' => $end->toDateTimeString(),
        ]);
    }

    public function test_cannot_create_schedule_with_conflict()
    {
        $room = Room::factory()->create();
        $class = ChessClass::factory()->create();
        $start = Carbon::now()->addDay()->setHour(10)->setMinute(0);
        $end = $start->copy()->addHour(); // 10:00 - 11:00

        // Create existing schedule
        ClassSchedule::create([
            'class_id' => $class->id,
            'room_id' => $room->id,
            'start_time' => $start,
            'end_time' => $end,
        ]);

        // Try to create overlapping schedule (exact match)
        $response = $this->actingAs($this->admin)->post(route('admin.schedules.store'), [
            'class_id' => $class->id,
            'room_id' => $room->id,
            'start_time' => $start->toDateTimeString(),
            'end_time' => $end->toDateTimeString(),
        ]);

        $response->assertSessionHasErrors('room_id');
        
        // Try overlapping start (09:30 - 10:30)
        $response = $this->actingAs($this->admin)->post(route('admin.schedules.store'), [
            'class_id' => $class->id,
            'room_id' => $room->id,
            'start_time' => $start->copy()->subMinutes(30)->toDateTimeString(),
            'end_time' => $start->copy()->addMinutes(30)->toDateTimeString(),
        ]);
        $response->assertSessionHasErrors('room_id');

        // Try overlapping end (10:30 - 11:30)
        $response = $this->actingAs($this->admin)->post(route('admin.schedules.store'), [
            'class_id' => $class->id,
            'room_id' => $room->id,
            'start_time' => $start->copy()->addMinutes(30)->toDateTimeString(),
            'end_time' => $end->copy()->addMinutes(30)->toDateTimeString(),
        ]);
        $response->assertSessionHasErrors('room_id');

        // Try enclosed (10:15 - 10:45)
        $response = $this->actingAs($this->admin)->post(route('admin.schedules.store'), [
            'class_id' => $class->id,
            'room_id' => $room->id,
            'start_time' => $start->copy()->addMinutes(15)->toDateTimeString(),
            'end_time' => $end->copy()->subMinutes(15)->toDateTimeString(),
        ]);
        $response->assertSessionHasErrors('room_id');

        // Try enclosing (09:00 - 12:00)
        $response = $this->actingAs($this->admin)->post(route('admin.schedules.store'), [
            'class_id' => $class->id,
            'room_id' => $room->id,
            'start_time' => $start->copy()->subHour()->toDateTimeString(),
            'end_time' => $end->copy()->addHour()->toDateTimeString(),
        ]);
        $response->assertSessionHasErrors('room_id');
    }

    public function test_can_create_adjacent_schedule()
    {
        $room = Room::factory()->create();
        $class = ChessClass::factory()->create();
        $start = Carbon::now()->addDay()->setHour(10)->setMinute(0);
        $end = $start->copy()->addHour(); // 10:00 - 11:00

        // Create existing schedule
        ClassSchedule::create([
            'class_id' => $class->id,
            'room_id' => $room->id,
            'start_time' => $start,
            'end_time' => $end,
        ]);

        // Try immediately after (11:00 - 12:00)
        $response = $this->actingAs($this->admin)->post(route('admin.schedules.store'), [
            'class_id' => $class->id,
            'room_id' => $room->id,
            'start_time' => $end->toDateTimeString(),
            'end_time' => $end->copy()->addHour()->toDateTimeString(),
        ]);

        $response->assertSessionHas('success');
    }
}
