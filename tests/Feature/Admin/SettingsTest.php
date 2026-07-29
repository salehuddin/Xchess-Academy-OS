<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_unified_settings_page(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);

        $response = $this->actingAs($admin)->get(route('admin.settings.index'));

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
            'whatsapp_access_token' => '',
            'whatsapp_phone_number_id' => '',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
    }

    public function test_admin_can_update_notification_system_settings(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);

        $response = $this->actingAs($admin)->post(route('admin.settings.notifications.update'), [
            'notifications_enabled' => true,
            'notifications_daily_limit' => 500,
            'notifications_retry_attempts' => 5,
            'notifications_retry_delay_minutes' => 60,
            'notifications_admin_alert_email' => 'admin@xchess.test',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
    }

    public function test_admin_can_update_company_website_and_support_settings(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);

        $response = $this->actingAs($admin)->post(route('admin.settings.company.update'), [
            'company_name' => 'X Chess Academy',
            'company_reg_no' => '202401012345',
            'company_email' => 'info@xchessacademy.com',
            'company_phone' => '+60 12-345 6789',
            'company_address' => 'Chess Tower, KL',
            'company_bank_details' => 'Maybank 1234',
            'company_website' => 'https://xchessacademy.com',
            'support_email' => 'support@xchessacademy.com',
            'support_phone' => '+60 12-345 6789',
            'support_hours' => 'Mon-Fri, 9am - 6pm',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertSame('https://xchessacademy.com', Setting::get('company_website'));
        $this->assertSame('support@xchessacademy.com', Setting::get('support_email'));
    }

    public function test_admin_can_upload_academy_logo(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);

        $response = $this->actingAs($admin)
            ->post(route('admin.settings.logo.upload'), [
                'logo' => UploadedFile::fake()->image('logo.png', 200, 200),
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertNotNull(Setting::get('company_logo'));
        Storage::disk('public')->assertExists(Setting::get('company_logo'));
    }

    public function test_logo_upload_rejects_non_image_files(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);

        $response = $this->actingAs($admin)
            ->post(route('admin.settings.logo.upload'), [
                'logo' => UploadedFile::fake()->create('document.pdf', 100, 'application/pdf'),
            ]);

        $response->assertSessionHasErrors(['logo']);
    }

    public function test_admin_can_remove_existing_logo(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);

        $path = UploadedFile::fake()->image('logo.png', 100, 100)->store('logos', 'public');
        Setting::set('company_logo', $path, 'company');
        Storage::disk('public')->assertExists($path);

        $response = $this->actingAs($admin)
            ->delete(route('admin.settings.logo.remove'));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        Storage::disk('public')->assertMissing($path);
        $this->assertEmpty(Setting::get('company_logo'));
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

        $this->actingAs($coach)->get(route('admin.settings.index'))->assertStatus(403);
        $this->actingAs($coach)->get(route('admin.activity-logs.index'))->assertStatus(403);
        $this->actingAs($coach)->get(route('admin.system-logs.index'))->assertStatus(403);
    }
}
