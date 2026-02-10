<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\ChessClass;
use App\Models\ClassSchedule;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScheduleConflictTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private Room $room;
    private ChessClass $chessClass;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => UserRole::Admin->value]);

        $this->room = Room::factory()->create();
        $this->chessClass = ChessClass::factory()->create();
    }

    public function test_it_can_create_a_schedule_if_no_conflict()
    {
        $response = $this->actingAs($this->admin)->post(route('admin.schedules.store'), [
            'class_id' => $this->chessClass->id,
            'room_id' => $this->room->id,
            'start_time' => now()->addDay()->setHour(10)->setMinute(0)->toDateTimeString(),
            'end_time' => now()->addDay()->setHour(11)->setMinute(0)->toDateTimeString(),
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseCount('class_schedules', 1);
    }

    public function test_it_fails_if_exact_time_match_exists()
    {
        $start = now()->addDay()->setHour(10)->setMinute(0);
        $end = now()->addDay()->setHour(11)->setMinute(0);

        ClassSchedule::factory()->create([
            'room_id' => $this->room->id,
            'start_time' => $start,
            'end_time' => $end,
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.schedules.store'), [
            'class_id' => $this->chessClass->id,
            'room_id' => $this->room->id,
            'start_time' => $start->toDateTimeString(),
            'end_time' => $end->toDateTimeString(),
        ]);

        $response->assertSessionHasErrors(['room_id']);
    }

    public function test_it_fails_if_new_schedule_overlaps_start()
    {
        // Existing: 10:00 - 11:00
        // New: 09:30 - 10:30
        ClassSchedule::factory()->create([
            'room_id' => $this->room->id,
            'start_time' => now()->addDay()->setHour(10)->setMinute(0),
            'end_time' => now()->addDay()->setHour(11)->setMinute(0),
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.schedules.store'), [
            'class_id' => $this->chessClass->id,
            'room_id' => $this->room->id,
            'start_time' => now()->addDay()->setHour(9)->setMinute(30)->toDateTimeString(),
            'end_time' => now()->addDay()->setHour(10)->setMinute(30)->toDateTimeString(),
        ]);

        $response->assertSessionHasErrors(['room_id']);
    }

    public function test_it_fails_if_new_schedule_overlaps_end()
    {
        // Existing: 10:00 - 11:00
        // New: 10:30 - 11:30
        ClassSchedule::factory()->create([
            'room_id' => $this->room->id,
            'start_time' => now()->addDay()->setHour(10)->setMinute(0),
            'end_time' => now()->addDay()->setHour(11)->setMinute(0),
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.schedules.store'), [
            'class_id' => $this->chessClass->id,
            'room_id' => $this->room->id,
            'start_time' => now()->addDay()->setHour(10)->setMinute(30)->toDateTimeString(),
            'end_time' => now()->addDay()->setHour(11)->setMinute(30)->toDateTimeString(),
        ]);

        $response->assertSessionHasErrors(['room_id']);
    }

    public function test_it_fails_if_new_schedule_is_inside_existing()
    {
        // Existing: 10:00 - 12:00
        // New: 10:30 - 11:30
        ClassSchedule::factory()->create([
            'room_id' => $this->room->id,
            'start_time' => now()->addDay()->setHour(10)->setMinute(0),
            'end_time' => now()->addDay()->setHour(12)->setMinute(0),
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.schedules.store'), [
            'class_id' => $this->chessClass->id,
            'room_id' => $this->room->id,
            'start_time' => now()->addDay()->setHour(10)->setMinute(30)->toDateTimeString(),
            'end_time' => now()->addDay()->setHour(11)->setMinute(30)->toDateTimeString(),
        ]);

        $response->assertSessionHasErrors(['room_id']);
    }

    public function test_it_fails_if_new_schedule_encompasses_existing()
    {
        // Existing: 10:30 - 11:30
        // New: 10:00 - 12:00
        ClassSchedule::factory()->create([
            'room_id' => $this->room->id,
            'start_time' => now()->addDay()->setHour(10)->setMinute(30),
            'end_time' => now()->addDay()->setHour(11)->setMinute(30),
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.schedules.store'), [
            'class_id' => $this->chessClass->id,
            'room_id' => $this->room->id,
            'start_time' => now()->addDay()->setHour(10)->setMinute(0)->toDateTimeString(),
            'end_time' => now()->addDay()->setHour(12)->setMinute(0)->toDateTimeString(),
        ]);

        $response->assertSessionHasErrors(['room_id']);
    }

    public function test_it_allows_scheduling_in_different_room()
    {
        $otherRoom = Room::factory()->create();

        // Existing in Room 1: 10:00 - 11:00
        ClassSchedule::factory()->create([
            'room_id' => $this->room->id,
            'start_time' => now()->addDay()->setHour(10)->setMinute(0),
            'end_time' => now()->addDay()->setHour(11)->setMinute(0),
        ]);

        // New in Room 2: 10:00 - 11:00
        $response = $this->actingAs($this->admin)->post(route('admin.schedules.store'), [
            'class_id' => $this->chessClass->id,
            'room_id' => $otherRoom->id,
            'start_time' => now()->addDay()->setHour(10)->setMinute(0)->toDateTimeString(),
            'end_time' => now()->addDay()->setHour(11)->setMinute(0)->toDateTimeString(),
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
    }
}
