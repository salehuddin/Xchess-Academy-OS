<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\ChessClass;
use App\Models\Invoice;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_dashboard_with_stats()
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);

        // Create some data
        Student::factory()->count(5)->create();
        ChessClass::factory()->count(3)->create();
        Invoice::factory()->create(['status' => 'Pending']);
        Invoice::factory()->create(['status' => 'Paid', 'total_amount' => 100, 'month_year' => now()->format('Y-m')]);

        $response = $this->actingAs($admin)->get('/dashboard');

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->has('stats', fn (Assert $json) => $json
                    ->where('total_students', 7) // 5 created explicitly + 2 from invoice factories
                    ->where('total_classes', 3)
                    ->where('pending_invoices', 1)
                    ->where('monthly_revenue', '100.00')
                    ->etc()
                )
            );
    }

    public function test_coach_can_view_dashboard_with_stats()
    {
        $coach = User::factory()->create(['role' => UserRole::Coach]);

        // Create a class assigned to this coach
        ChessClass::factory()->create(['coach_id' => $coach->id]);
        // Create a class assigned to another coach
        ChessClass::factory()->create();

        // Visiting /dashboard redirects coach to coach.dashboard
        $response = $this->actingAs($coach)->get('/dashboard');
        $response->assertRedirect(route('coach.dashboard'));

        // Visiting coach.dashboard renders Coach/Dashboard component
        $response = $this->actingAs($coach)->get(route('coach.dashboard'));
        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Coach/Dashboard')
                ->has('stats', fn (Assert $json) => $json
                    ->where('my_classes', 1)
                    ->etc()
                )
            );
    }
}
