<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Spatie\Activitylog\Models\Activity;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_user_management_page(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        User::factory()->create();

        $response = $this->actingAs($admin)->get('/admin/users');

        $response->assertOk();
    }

    public function test_non_admin_cannot_view_user_management_page(): void
    {
        $user = User::factory()->create(['role' => UserRole::Ops->value]);

        $response = $this->actingAs($user)->get('/admin/users');

        $response->assertForbidden();
    }

    public function test_admin_can_change_user_role_and_it_is_audited(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $user = User::factory()->create(['role' => UserRole::Ops->value]);

        $response = $this
            ->actingAs($admin)
            ->put(route('admin.users.role.update', $user), [
                'role' => UserRole::Coach->value,
            ]);

        $response->assertRedirect();

        $this->assertSame(UserRole::Coach, $user->refresh()->role);

        $this->assertTrue(Activity::query()
            ->where('subject_type', User::class)
            ->where('subject_id', $user->id)
            ->where('causer_type', User::class)
            ->where('causer_id', $admin->id)
            ->exists());
    }

    public function test_access_finance_gate_allows_finance_and_admin(): void
    {
        $finance = User::factory()->create(['role' => UserRole::Finance->value]);
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $ops = User::factory()->create(['role' => UserRole::Ops->value]);

        $this->assertTrue(Gate::forUser($finance)->allows('access-finance'));
        $this->assertTrue(Gate::forUser($admin)->allows('access-finance'));
        $this->assertFalse(Gate::forUser($ops)->allows('access-finance'));
    }
}
