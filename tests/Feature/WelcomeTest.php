<?php

namespace Tests\Feature;

use App\Models\SiteAnnouncement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class WelcomeTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_page_loads_and_renders_welcome_component(): void
    {
        $response = $this->get(route('home'));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Welcome')
                ->has('company')
                ->has('support')
                ->has('announcements')
            );
    }

    public function test_home_page_displays_portal_welcome_header_and_not_marketing_hero(): void
    {
        $response = $this->get(route('home'));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Welcome')
                ->has('company.website')
            );
    }

    public function test_home_page_shows_external_website_link_and_help_text(): void
    {
        $response = $this->get(route('home'));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Welcome')
                ->has('company.website')
                ->has('support.email')
            );
    }

    public function test_home_page_surfaces_active_published_announcements(): void
    {
        SiteAnnouncement::factory()->create([
            'title' => 'Summer Camp Open',
            'body' => '<p>Register now</p>',
            'type' => 'success',
            'is_active' => true,
            'published_at' => now()->subDay(),
        ]);

        $response = $this->get(route('home'));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Welcome')
                ->has('announcements', 1)
                ->has('announcements.0', fn (Assert $a) => $a
                    ->where('title', 'Summer Camp Open')
                    ->where('type', 'success')
                    ->etc()
                )
            );
    }

    public function test_home_page_hides_inactive_unpublished_or_expired_announcements(): void
    {
        SiteAnnouncement::factory()->create(['is_active' => false, 'published_at' => now()->subDay()]);
        SiteAnnouncement::factory()->create(['is_active' => true, 'published_at' => now()->addDay()]);
        SiteAnnouncement::factory()->create(['is_active' => true, 'published_at' => now()->subDay(), 'expires_at' => now()->subHour()]);

        $response = $this->get(route('home'));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Welcome')
                ->has('announcements', 0)
            );
    }

    public function test_home_page_shows_dashboard_button_for_authenticated_users(): void
    {
        $admin = User::factory()->create(['role' => 'Admin']);

        $response = $this->actingAs($admin)->get(route('home'));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Welcome')
                ->where('canLogin', true)
                ->has('auth.user')
                ->etc()
            );
    }
}
