<?php

namespace Tests\Feature\Portal;

use App\Models\Invoice;
use App\Models\Student;
use App\Models\StudentParent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ParentPortalTest extends TestCase
{
    use RefreshDatabase;

    public function test_portal_page_renders_with_summary_and_contact_props(): void
    {
        $parent = StudentParent::factory()->create([
            'unique_access_token' => 'token-portal-123',
        ]);
        $student = Student::factory()->create([
            'parent_id' => $parent->id,
        ]);
        Invoice::factory()->create([
            'student_id' => $student->id,
            'status' => 'Pending',
            'total_amount' => 150.00,
        ]);

        $response = $this->get(route('portal.parent', 'token-portal-123'));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('ParentPortal/Index')
                ->where('parent.name', $parent->name)
                ->where('summary.pending_count', 1)
                ->where('summary.pending_amount', 150)
                ->has('contact.whatsapp_url')
                ->has('next_session')
                ->where('invoices.0.student_id', $student->id));
    }

    public function test_student_details_returns_own_student_without_internal_fields(): void
    {
        $parent = StudentParent::factory()->create([
            'unique_access_token' => 'token-portal-456',
        ]);
        $student = Student::factory()->create([
            'parent_id' => $parent->id,
            'admin_notes' => 'Internal note not for parents',
            'recurring_discount' => 25,
        ]);

        $response = $this->get(route('portal.students.details', ['token-portal-456', $student]));

        $response->assertStatus(200)
            ->assertJsonPath('id', $student->id)
            ->assertJsonPath('name', $student->name)
            ->assertJsonMissing(['admin_notes' => 'Internal note not for parents'])
            ->assertJsonMissing(['recurring_discount' => 25]);

        $json = $response->json();
        $this->assertArrayNotHasKey('admin_notes', $json);
        $this->assertArrayNotHasKey('recurring_discount', $json);
        $this->assertArrayNotHasKey('parent', $json);
        $this->assertArrayNotHasKey('invoices', $json);
        $this->assertArrayHasKey('classes', $json);
        $this->assertArrayHasKey('attendances', $json);
    }

    public function test_student_details_denies_another_parents_student(): void
    {
        $parent = StudentParent::factory()->create([
            'unique_access_token' => 'token-portal-789',
        ]);
        $otherStudent = Student::factory()->create();

        $response = $this->get(route('portal.students.details', ['token-portal-789', $otherStudent]));

        $response->assertStatus(404);
    }

    public function test_student_details_denies_invalid_token(): void
    {
        $student = Student::factory()->create();

        $response = $this->get(route('portal.students.details', ['unknown-token', $student]));

        $response->assertStatus(404);
    }
}
