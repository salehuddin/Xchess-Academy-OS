<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_external_services_settings_page(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);

        $response = $this->actingAs($admin)->get(route('admin.settings.services'));

        $response->assertStatus(200);
    }

    public function test_admin_can_update_external_services_settings(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);

        $response = $this->actingAs($admin)->post(route('admin.settings.services.update'), [
            'chip_environment' => 'sandbox',
            'chip_brand_id' => 'BRAND_12345',
            'chip_api_key' => 'SECRET_KEY_123',
            'chip_webhook_secret' => 'WEBHOOK_SECRET_123',
            'mail_host' => 'smtp.mailtrap.io',
            'mail_port' => 2525,
            'mail_username' => 'user_123',
            'mail_password' => 'pass_123',
            'mail_encryption' => 'tls',
            'mail_from_address' => 'admin@xchess.test',
            'mail_from_name' => 'X Chess Admin',
            'whatsapp_provider' => 'twilio',
            'whatsapp_account_sid' => 'AC_TWILIO_123',
            'whatsapp_auth_token' => 'AUTH_TOKEN_123',
            'whatsapp_phone_number' => '+60123456789',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
    }

    public function test_admin_can_view_user_activity_logs(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);

        $response = $this->actingAs($admin)->get(route('admin.activity-logs.index'));

        $response->assertStatus(200);
    }

    public function test_admin_can_view_system_logs(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);

        $response = $this->actingAs($admin)->get(route('admin.system-logs.index'));

        $response->assertStatus(200);
    }

    public function test_non_admin_cannot_access_settings_pages(): void
    {
        $coach = User::factory()->create(['role' => UserRole::Coach->value]);

        $this->actingAs($coach)->get(route('admin.settings.services'))->assertStatus(403);
        $this->actingAs($coach)->get(route('admin.activity-logs.index'))->assertStatus(403);
        $this->actingAs($coach)->get(route('admin.system-logs.index'))->assertStatus(403);
    }
}
