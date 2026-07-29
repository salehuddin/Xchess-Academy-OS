<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\SiteAnnouncement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SiteAnnouncementCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_site_announcements_index(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);

        SiteAnnouncement::factory()->count(2)->create();

        $response = $this->actingAs($admin)->get(route('admin.site-announcements.index'));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/SiteAnnouncements/Index')
                ->has('announcements.data', 2)
            );
    }

    public function test_admin_can_create_a_site_announcement(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);

        $response = $this->actingAs($admin)->post(route('admin.site-announcements.store'), [
            'title' => 'Holiday Closure',
            'body' => '<p>We are closed on Monday.</p>',
            'type' => 'warning',
            'is_active' => true,
            'published_at' => now()->format('Y-m-d\TH:i'),
            'expires_at' => now()->addDays(7)->format('Y-m-d\TH:i'),
        ]);

        $response->assertRedirect(route('admin.site-announcements.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('site_announcements', [
            'title' => 'Holiday Closure',
            'type' => 'warning',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_update_a_site_announcement(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $announcement = SiteAnnouncement::factory()->create(['is_active' => true]);

        $response = $this->actingAs($admin)
            ->put(route('admin.site-announcements.update', $announcement), [
                'title' => 'Updated Title',
                'body' => $announcement->body,
                'type' => 'info',
                'is_active' => false,
                'published_at' => now()->format('Y-m-d\TH:i'),
                'expires_at' => '',
            ]);

        $response->assertRedirect(route('admin.site-announcements.index'));

        $this->assertDatabaseHas('site_announcements', [
            'id' => $announcement->id,
            'title' => 'Updated Title',
            'is_active' => false,
        ]);
    }

    public function test_admin_can_delete_a_site_announcement(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $announcement = SiteAnnouncement::factory()->create();

        $response = $this->actingAs($admin)
            ->delete(route('admin.site-announcements.destroy', $announcement));

        $response->assertRedirect(route('admin.site-announcements.index'));

        $this->assertDatabaseMissing('site_announcements', ['id' => $announcement->id]);
    }

    public function test_non_admin_cannot_access_site_announcements(): void
    {
        $coach = User::factory()->create(['role' => UserRole::Coach->value]);

        $this->actingAs($coach)->get(route('admin.site-announcements.index'))->assertStatus(403);
    }

    public function test_guest_cannot_access_site_announcements(): void
    {
        $this->get(route('admin.site-announcements.index'))->assertRedirect('/login');
    }
}
