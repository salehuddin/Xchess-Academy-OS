<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DualRoleUserTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_created_with_is_coach_appears_in_coaches_scope(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);

        $response = $this->actingAs($admin)->post(route('admin.users.store'), [
            'name' => 'Admin Coach Dual',
            'email' => 'admincoach@xchess.test',
            'password' => 'password123',
            'role' => UserRole::Admin->value,
            'is_coach' => true,
            'hourly_rate' => 60.00,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $dualUser = User::where('email', 'admincoach@xchess.test')->firstOrFail();
        $this->assertTrue($dualUser->is_coach);
        $this->assertTrue($dualUser->isCoach());

        $coachesList = User::coaches()->pluck('id')->toArray();
        $this->assertContains($dualUser->id, $coachesList);
    }

    public function test_existing_user_can_be_updated_to_is_coach(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $opsUser = User::factory()->create(['role' => UserRole::Ops->value, 'is_coach' => false]);

        $response = $this->actingAs($admin)->put(route('admin.users.update', $opsUser->id), [
            'name' => $opsUser->name,
            'email' => $opsUser->email,
            'role' => UserRole::Ops->value,
            'is_coach' => true,
            'hourly_rate' => 40.00,
        ]);

        $response->assertRedirect();
        $opsUser->refresh();
        $this->assertTrue($opsUser->is_coach);
        $this->assertNotNull($opsUser->coachProfile);
    }
}
