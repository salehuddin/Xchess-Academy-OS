<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\Invoice;
use App\Models\InvoiceAdjustment;
use App\Models\Student;
use App\Models\StudentParent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentAdjustmentTest extends TestCase
{
    use RefreshDatabase;

    private function makeStudent(): Student
    {
        $parent = StudentParent::factory()->create();

        return Student::factory()->create(['parent_id' => $parent->id]);
    }

    public function test_admin_can_record_carry_forward_adjustment_on_student()
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $student = $this->makeStudent();

        $this->actingAs($admin)->post(route('admin.students.adjustments.store', $student), [
            'type' => 'credit',
            'amount' => 50,
            'reason' => 'Refund for cancelled class',
        ])->assertRedirect();

        $this->assertDatabaseHas('invoice_adjustments', [
            'student_id' => $student->id,
            'invoice_id' => null,
            'applied_from_id' => null,
            'type' => 'credit',
            'amount' => 50,
            'status' => 'pending',
        ]);
    }

    public function test_admin_can_update_pending_adjustment()
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $student = $this->makeStudent();
        $adjustment = InvoiceAdjustment::create([
            'student_id' => $student->id,
            'type' => 'credit',
            'amount' => 50,
            'reason' => 'Old reason',
            'status' => 'pending',
        ]);

        $this->actingAs($admin)->put(route('admin.students.adjustments.update', [$student, $adjustment]), [
            'type' => 'charge',
            'amount' => 30,
            'reason' => 'Tournament fee',
        ])->assertRedirect();

        $this->assertDatabaseHas('invoice_adjustments', [
            'id' => $adjustment->id,
            'type' => 'charge',
            'amount' => 30,
            'reason' => 'Tournament fee',
            'status' => 'pending',
        ]);
    }

    public function test_admin_can_delete_pending_adjustment()
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $student = $this->makeStudent();
        $adjustment = InvoiceAdjustment::create([
            'student_id' => $student->id,
            'type' => 'credit',
            'amount' => 50,
            'reason' => 'Refund',
            'status' => 'pending',
        ]);

        $this->actingAs($admin)->delete(route('admin.students.adjustments.destroy', [$student, $adjustment]))->assertRedirect();

        $this->assertDatabaseMissing('invoice_adjustments', ['id' => $adjustment->id]);
    }

    public function test_applied_adjustment_cannot_be_updated_or_deleted()
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $student = $this->makeStudent();
        $invoice = Invoice::factory()->create(['student_id' => $student->id, 'status' => 'Draft']);
        $adjustment = InvoiceAdjustment::create([
            'invoice_id' => $invoice->id,
            'student_id' => $student->id,
            'type' => 'credit',
            'amount' => 50,
            'reason' => 'Applied credit',
            'status' => 'applied',
        ]);

        $this->actingAs($admin)->put(route('admin.students.adjustments.update', [$student, $adjustment]), [
            'type' => 'credit',
            'amount' => 99,
            'reason' => 'Changed',
        ])->assertForbidden();

        $this->actingAs($admin)->delete(route('admin.students.adjustments.destroy', [$student, $adjustment]))->assertForbidden();

        $this->assertDatabaseHas('invoice_adjustments', [
            'id' => $adjustment->id,
            'amount' => 50,
            'status' => 'applied',
        ]);
    }

    public function test_adjustment_must_belong_to_the_student()
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $studentA = $this->makeStudent();
        $studentB = $this->makeStudent();

        $adjustment = InvoiceAdjustment::create([
            'student_id' => $studentB->id,
            'type' => 'credit',
            'amount' => 50,
            'reason' => 'Belongs to B',
            'status' => 'pending',
        ]);

        // Trying to delete B's adjustment through A's route → not found.
        $this->actingAs($admin)->delete(route('admin.students.adjustments.destroy', [$studentA, $adjustment]))->assertNotFound();

        $this->assertDatabaseHas('invoice_adjustments', ['id' => $adjustment->id]);
    }

    public function test_finance_can_manage_adjustments()
    {
        $finance = User::factory()->create(['role' => UserRole::Finance]);
        $student = $this->makeStudent();

        $this->actingAs($finance)->post(route('admin.students.adjustments.store', $student), [
            'type' => 'charge',
            'amount' => 25,
            'reason' => 'Additional fee',
        ])->assertRedirect();

        $this->assertDatabaseHas('invoice_adjustments', [
            'student_id' => $student->id,
            'type' => 'charge',
            'amount' => 25,
            'status' => 'pending',
        ]);
    }

    public function test_coach_cannot_manage_adjustments()
    {
        $coach = User::factory()->create(['role' => UserRole::Coach]);
        $student = $this->makeStudent();

        $this->actingAs($coach)->post(route('admin.students.adjustments.store', $student), [
            'type' => 'credit',
            'amount' => 10,
            'reason' => 'Nope',
        ])->assertForbidden();
    }

    public function test_finance_can_view_student_profile_with_adjustment_history()
    {
        $finance = User::factory()->create(['role' => UserRole::Finance]);
        $student = $this->makeStudent();

        InvoiceAdjustment::create([
            'student_id' => $student->id,
            'type' => 'credit',
            'amount' => 20,
            'reason' => 'Pending refund',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($finance)->get(route('admin.students.show', $student));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Students/Show')
                ->has('pendingAdjustments', 1)
                ->has('appliedAdjustments', 0)
            );
    }
}
