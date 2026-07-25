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
}
