<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_users_index_with_filters(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        User::factory()->create(['name' => 'John Coach', 'role' => UserRole::Coach->value]);

        $response = $this->actingAs($admin)->get(route('admin.users.index', [
            'search' => 'John',
            'role' => 'Coach',
        ]));

        $response->assertStatus(200);
        $response->assertSee('John Coach');
    }

    public function test_admin_can_create_new_user(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);

        $response = $this->actingAs($admin)->post(route('admin.users.store'), [
            'name' => 'Sarah Operations',
            'email' => 'sarah@xchess.test',
            'password' => 'password123',
            'role' => UserRole::Ops->value,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('users', [
            'email' => 'sarah@xchess.test',
            'role' => UserRole::Ops->value,
        ]);
    }

    public function test_admin_can_update_existing_user(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $user = User::factory()->create(['name' => 'Old Name', 'role' => UserRole::Coach->value]);

        $response = $this->actingAs($admin)->put(route('admin.users.update', $user->id), [
            'name' => 'Updated Name',
            'email' => $user->email,
            'role' => UserRole::Finance->value,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
            'role' => UserRole::Finance->value,
        ]);
    }

    public function test_admin_can_delete_user_but_not_self(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $otherUser = User::factory()->create(['role' => UserRole::Coach->value]);

        // Attempt self deletion (forbidden by policy)
        $selfResponse = $this->actingAs($admin)->delete(route('admin.users.destroy', $admin->id));
        $selfResponse->assertStatus(403);
        $this->assertDatabaseHas('users', ['id' => $admin->id]);

        // Delete other user
        $response = $this->actingAs($admin)->delete(route('admin.users.destroy', $otherUser->id));
        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('users', ['id' => $otherUser->id]);
    }

    public function test_non_admin_cannot_manage_users(): void
    {
        $coach = User::factory()->create(['role' => UserRole::Coach->value]);

        $this->actingAs($coach)->get(route('admin.users.index'))->assertStatus(403);
        $this->actingAs($coach)->post(route('admin.users.store'), [])->assertStatus(403);
    }
}
