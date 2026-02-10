<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\ChessClass;
use App\Models\Package;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClassManagementTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $coach;
    protected $package;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => UserRole::Admin,
        ]);

        $this->coach = User::factory()->create([
            'role' => UserRole::Coach,
        ]);

        $this->package = Package::factory()->create();
    }

    public function test_admin_can_view_classes_index()
    {
        ChessClass::factory()->create([
            'coach_id' => $this->coach->id,
            'package_id' => $this->package->id,
        ]);

        $response = $this->actingAs($this->admin)->get(route('admin.classes.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Classes/Index')
            ->has('classes.data', 1)
        );
    }

    public function test_admin_can_create_class()
    {
        $response = $this->actingAs($this->admin)
            ->from(route('admin.classes.index'))
            ->post(route('admin.classes.store'), [
            'coach_id' => $this->coach->id,
            'package_id' => $this->package->id,
        ]);

        $response->assertRedirect(route('admin.classes.index'));
        $this->assertDatabaseHas('classes', [
            'coach_id' => $this->coach->id,
            'package_id' => $this->package->id,
        ]);
    }

    public function test_admin_can_enroll_student_to_class()
    {
        $chessClass = ChessClass::factory()->create([
            'coach_id' => $this->coach->id,
            'package_id' => $this->package->id,
        ]);

        $student = Student::factory()->create();

        $response = $this->actingAs($this->admin)->post(route('admin.classes.enroll', $chessClass->id), [
            'student_id' => $student->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('student_classes', [
            'class_id' => $chessClass->id,
            'student_id' => $student->id,
        ]);
    }

    public function test_admin_can_unenroll_student_from_class()
    {
        $chessClass = ChessClass::factory()->create([
            'coach_id' => $this->coach->id,
            'package_id' => $this->package->id,
        ]);

        $student = Student::factory()->create();
        $chessClass->students()->attach($student);

        $response = $this->actingAs($this->admin)->delete(route('admin.classes.unenroll', [$chessClass->id, $student->id]));

        $response->assertRedirect();
        $this->assertDatabaseMissing('student_classes', [
            'class_id' => $chessClass->id,
            'student_id' => $student->id,
        ]);
    }

    public function test_admin_can_view_class_details()
    {
        $chessClass = ChessClass::factory()->create([
            'coach_id' => $this->coach->id,
            'package_id' => $this->package->id,
        ]);

        $response = $this->actingAs($this->admin)->get(route('admin.classes.show', $chessClass->id));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Classes/Show')
            ->where('chessClass.id', $chessClass->id)
        );
    }
}
