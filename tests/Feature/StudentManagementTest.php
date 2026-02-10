<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Student;
use App\Models\StudentParent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => UserRole::Admin->value]);
    }

    public function test_can_list_students()
    {
        Student::factory()->count(3)->create();

        $response = $this->actingAs($this->admin)->get(route('admin.students.index'));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Students/Index')
                ->has('students.data', 3)
            );
    }

    public function test_can_create_student_with_new_parent()
    {
        $response = $this->actingAs($this->admin)->post(route('admin.students.store'), [
            'name' => 'John Doe Jr',
            'nric_passport' => '123456789012',
            'preferred_language' => 'English',
            'date_of_registration' => '2025-01-01',
            'current_level' => 'Beginner',
            'recurring_discount' => 10,
            'parent_mode' => 'new',
            'parent_name' => 'John Doe Sr',
            'parent_email' => 'john.sr@example.com',
            'parent_phone' => '1234567890',
        ]);

        $response->assertRedirect(route('admin.students.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('parents', [
            'name' => 'John Doe Sr',
            'email' => 'john.sr@example.com',
        ]);

        $this->assertDatabaseHas('students', [
            'name' => 'John Doe Jr',
            'current_level' => 'Beginner',
            'recurring_discount' => 10,
        ]);
    }

    public function test_can_create_student_with_existing_parent()
    {
        $parent = StudentParent::factory()->create();

        $response = $this->actingAs($this->admin)->post(route('admin.students.store'), [
            'name' => 'Jane Doe',
            'nric_passport' => '987654321098',
            'preferred_language' => 'English',
            'date_of_registration' => '2025-01-01',
            'current_level' => 'Advanced',
            'parent_mode' => 'existing',
            'parent_id' => $parent->id,
        ]);

        $response->assertRedirect(route('admin.students.index'));

        $this->assertDatabaseHas('students', [
            'name' => 'Jane Doe',
            'parent_id' => $parent->id,
        ]);
    }

    public function test_can_update_student()
    {
        $student = Student::factory()->create();
        $newParent = StudentParent::factory()->create();

        $response = $this->actingAs($this->admin)->put(route('admin.students.update', $student), [
            'name' => 'Updated Name',
            'nric_passport' => '111122223333',
            'preferred_language' => 'English',
            'date_of_registration' => '2025-01-01',
            'current_level' => 'Intermediate',
            'recurring_discount' => 50,
            'status' => 'Suspended',
            'parent_id' => $newParent->id,
        ]);

        $response->assertRedirect(route('admin.students.index'));

        $this->assertDatabaseHas('students', [
            'id' => $student->id,
            'name' => 'Updated Name',
            'status' => 'Suspended',
            'parent_id' => $newParent->id,
        ]);
    }

    public function test_can_view_student_details()
    {
        $student = Student::factory()->create();

        $response = $this->actingAs($this->admin)->get(route('admin.students.show', $student));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Students/Show')
                ->has('student')
                ->where('student.id', $student->id)
                ->has('availableClasses')
            );
    }
}
