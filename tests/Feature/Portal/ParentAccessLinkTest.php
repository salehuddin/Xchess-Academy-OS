<?php

namespace Tests\Feature\Portal;

use App\Mail\ParentPortalAccess;
use App\Models\StudentParent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ParentAccessLinkTest extends TestCase
{
    use RefreshDatabase;

    public function test_access_request_page_loads(): void
    {
        $response = $this->get(route('parent.access'));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page->component('ParentAccess'));
    }

    public function test_known_email_sends_access_link_mailable(): void
    {
        Mail::fake();

        $parent = StudentParent::factory()->create([
            'email' => 'parent@example.test',
            'unique_access_token' => 'token-abc-123',
        ]);

        $response = $this->post(route('parent.access.store'), ['email' => 'parent@example.test']);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        Mail::assertSent(ParentPortalAccess::class, function ($mail) use ($parent) {
            return $mail->parent->is($parent)
                && $mail->envelope()->subject === 'Your XChess Academy Parent Portal Access Link';
        });
    }

    public function test_unknown_email_returns_same_success_message_without_sending(): void
    {
        Mail::fake();

        $response = $this->post(route('parent.access.store'), ['email' => 'nobody@example.test']);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        Mail::assertNothingSent();
    }

    public function test_requires_valid_email(): void
    {
        $response = $this->post(route('parent.access.store'), ['email' => 'not-an-email']);

        $response->assertSessionHasErrors(['email']);
    }
}
