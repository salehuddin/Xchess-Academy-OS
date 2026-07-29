<?php

namespace Tests\Feature\Portal;

use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthLayoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_page_renders_portal_branding_and_support_info(): void
    {
        Setting::set('company_website', 'https://xchessacademy.com', 'company');
        Setting::set('support_email', 'support@xchess-academy.com', 'company');

        $response = $this->get(route('login'));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Auth/Login')
                ->has('academy')
                ->where('academy.website', 'https://xchessacademy.com')
                ->where('academy.support_email', 'support@xchess-academy.com')
            );
    }

    public function test_login_page_renders_auth_layout_component(): void
    {
        $response = $this->get(route('login'));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Auth/Login')
                ->has('academy')
            );
    }

    public function test_academy_prop_is_shared_with_logo_url_when_logo_set(): void
    {
        Setting::set('company_logo', 'logos/test.png', 'company');

        $response = $this->get(route('login'));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->has('academy')
                ->has('academy.logo_url')
            );
    }

    public function test_academy_prop_logo_url_is_null_when_no_logo(): void
    {
        $response = $this->get(route('login'));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->where('academy.logo_url', null)
                ->etc()
            );
    }
}
