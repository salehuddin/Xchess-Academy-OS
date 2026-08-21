<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoomManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => UserRole::Admin,
        ]);
    }

    public function test_admin_can_view_rooms_index(): void
    {
        Room::factory()->count(3)->create();

        $response = $this->actingAs($this->admin)->get(route('admin.rooms.index'));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Rooms/Index')
                ->has('rooms.data', 3)
            );
    }

    public function test_admin_can_create_physical_room(): void
    {
        $payload = [
            'name' => 'Room 101',
            'mode' => 'physical',
            'location' => 'Kota Bharu',
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.rooms.store'), $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('rooms', [
            'name' => 'Room 101',
            'mode' => 'physical',
            'location' => 'Kota Bharu',
            'capacity' => 20,
            'platform' => null,
            'account_email' => null,
        ]);
    }

    public function test_admin_can_create_online_room(): void
    {
        $payload = [
            'name' => 'Online Class A',
            'mode' => 'online',
            'platform' => 'zoom',
            'account_email' => 'zoom.a@xchess.test',
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.rooms.store'), $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('rooms', [
            'name' => 'Online Class A',
            'mode' => 'online',
            'platform' => 'zoom',
            'account_email' => 'zoom.a@xchess.test',
            'capacity' => 20,
            'location' => null,
        ]);
    }

    public function test_cannot_create_room_with_duplicate_name(): void
    {
        Room::factory()->create(['name' => 'Existing Room']);

        $response = $this->actingAs($this->admin)->post(route('admin.rooms.store'), [
            'name' => 'Existing Room',
            'mode' => 'physical',
            'location' => 'Kota Bharu',
        ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_physical_room_requires_valid_location(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.rooms.store'), [
            'name' => 'Physical Room',
            'mode' => 'physical',
            'location' => '',
        ]);

        $response->assertSessionHasErrors('location');
    }

    public function test_online_room_requires_platform_and_email(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.rooms.store'), [
            'name' => 'Online Room',
            'mode' => 'online',
            'platform' => '',
            'account_email' => '',
        ]);

        $response->assertSessionHasErrors(['platform', 'account_email']);
    }

    public function test_admin_can_update_room(): void
    {
        $room = Room::factory()->create([
            'name' => 'Old Name',
            'mode' => 'physical',
            'location' => 'Kota Bharu',
            'capacity' => 15,
        ]);

        $response = $this->actingAs($this->admin)->put(route('admin.rooms.update', $room->id), [
            'name' => 'Updated Name',
            'mode' => 'physical',
            'location' => 'Melaka Tengah',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('rooms', [
            'id' => $room->id,
            'name' => 'Updated Name',
            'location' => 'Melaka Tengah',
            'capacity' => 15,
        ]);
    }

    public function test_admin_can_delete_room_without_schedules(): void
    {
        $room = Room::factory()->create();

        $response = $this->actingAs($this->admin)->delete(route('admin.rooms.destroy', $room->id));

        $response->assertRedirect();
        $this->assertDatabaseMissing('rooms', ['id' => $room->id]);
    }
}
