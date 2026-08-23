<?php

namespace Tests\Feature\Notifications;

use App\Enums\UserRole;
use App\Models\Attendance;
use App\Models\ChessClass;
use App\Models\ClassSession;
use App\Models\Invoice;
use App\Models\Package;
use App\Models\Student;
use App\Models\StudentParent;
use App\Models\User;
use App\Models\UserNotification;
use App\Services\Notifications\InAppNotifier;
use App\Services\Notifications\NotificationEngine;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class InAppNotificationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_task_assignment_notifies_assignee_and_department(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $ops1 = User::factory()->create(['role' => UserRole::Ops]); // assignee
        $ops2 = User::factory()->create(['role' => UserRole::Ops]); // dept member

        $response = $this->actingAs($admin)->post(route('admin.tasks.store'), [
            'title' => 'Call parent about missed session',
            'department' => 'Ops',
            'priority' => 'High',
            'user_id' => $ops1->id,
            'status' => 'Pending',
        ]);

        $response->assertRedirect();

        // Assignee gets a dedicated personal notification.
        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $ops1->id,
            'type' => 'task_assigned',
        ]);

        // Another department member also gets notified.
        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $ops2->id,
            'type' => 'task_assigned',
        ]);

        // Actor (admin) does NOT get a notification for their own action.
        $this->assertDatabaseMissing('user_notifications', [
            'user_id' => $admin->id,
            'type' => 'task_assigned',
        ]);
    }

    public function test_sending_invoice_creates_in_app_notification(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $finance = User::factory()->create(['role' => UserRole::Finance]);
        $parent = StudentParent::factory()->create(['email' => 'parent@example.com']);
        $student = Student::factory()->create(['parent_id' => $parent->id]);
        $invoice = Invoice::factory()->create([
            'student_id' => $student->id,
            'status' => 'Draft',
        ]);

        $this->actingAs($admin)->post(route('admin.invoices.send', $invoice))->assertRedirect();

        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $finance->id,
            'type' => 'invoice_sent',
        ]);
        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $admin->id,
            'type' => 'invoice_sent',
        ]);
    }

    public function test_payroll_generation_notifies_coach_and_admin(): void
    {
        $package = Package::factory()->create(['coach_rate_per_session' => 80.00]);
        $coach = User::factory()->create(['role' => UserRole::Coach]);
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $class = ChessClass::factory()->create([
            'coach_id' => $coach->id,
            'package_id' => $package->id,
            'schedules' => [],
        ]);
        $student = Student::factory()->create();

        $lastMonth = Carbon::now()->subMonth()->format('Y-m');
        $date1 = Carbon::now()->subMonth()->startOfMonth()->addDays(1)->format('Y-m-d');

        Attendance::create([
            'class_id' => $class->id,
            'attendance_date' => $date1,
            'student_id' => $student->id,
            'is_present' => true,
        ]);

        $this->artisan('payroll:generate-monthly', ['month' => $lastMonth])->assertExitCode(0);

        // Coach is personally notified.
        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $coach->id,
            'type' => 'payroll_ready',
        ]);

        // Admin receives a monthly summary (deduplicated across coaches).
        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $admin->id,
            'type' => 'payroll_ready',
        ]);
    }

    public function test_overdue_invoices_create_summary_notification(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $finance = User::factory()->create(['role' => UserRole::Finance]);

        Invoice::factory()->create([
            'status' => 'Pending',
            'due_date' => now()->subDay(),
        ]);

        (new NotificationEngine)->markInvoicesOverdue(Carbon::today());

        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $finance->id,
            'type' => 'invoice_overdue',
        ]);
        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $admin->id,
            'type' => 'invoice_overdue',
        ]);
        $this->assertDatabaseHas('invoices', ['status' => 'Overdue']);
    }

    public function test_attendance_reminder_only_fires_for_sessions_without_attendance(): void
    {
        $coach = User::factory()->create(['role' => UserRole::Coach]);
        $today = Carbon::today()->format('Y-m-d');

        // Session with NO attendance → should trigger a reminder.
        $classA = ChessClass::factory()->create(['coach_id' => $coach->id]);
        ClassSession::create([
            'class_id' => $classA->id,
            'session_date' => $today,
            'coach_id' => $coach->id,
        ]);

        // Session WITH attendance already logged → should NOT trigger.
        $classB = ChessClass::factory()->create(['coach_id' => $coach->id]);
        ClassSession::create([
            'class_id' => $classB->id,
            'session_date' => $today,
            'coach_id' => $coach->id,
        ]);
        $student = Student::factory()->create();
        Attendance::create([
            'class_id' => $classB->id,
            'attendance_date' => $today,
            'student_id' => $student->id,
            'is_present' => true,
        ]);

        $this->artisan('attendance:remind-pending', ['--date' => $today])->assertExitCode(0);

        // One notification for classA's session only.
        $coachNotifs = UserNotification::where('user_id', $coach->id)
            ->where('type', 'attendance_pending')
            ->get();

        $this->assertCount(1, $coachNotifs);
        $this->assertSame($classA->id, $coachNotifs->first()->data['class_id']);
    }

    public function test_dedup_key_is_idempotent(): void
    {
        $user = User::factory()->create();

        $notifier = app(InAppNotifier::class);

        $first = $notifier->notify($user, 'invoice_sent', 'First', null, null, null, 'invoice_sent:42');
        $second = $notifier->notify($user, 'invoice_sent', 'Second (should be skipped)', null, null, null, 'invoice_sent:42');

        $this->assertNotNull($first);
        $this->assertNull($second);
        $this->assertDatabaseCount('user_notifications', 1);
    }

    public function test_unread_endpoint_is_scoped_to_current_user(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        UserNotification::factory()->unread()->create(['user_id' => $userA->id]);
        UserNotification::factory()->unread()->create(['user_id' => $userA->id]);
        UserNotification::factory()->unread()->create(['user_id' => $userB->id]);

        $respA = $this->actingAs($userA)->get(route('me.notifications.unread'));
        $respA->assertStatus(200);
        $this->assertSame(2, $respA->json('count'));
        $this->assertCount(2, $respA->json('latest'));

        $respB = $this->actingAs($userB)->get(route('me.notifications.unread'));
        $this->assertSame(1, $respB->json('count'));
    }

    public function test_user_can_mark_a_notification_read(): void
    {
        $user = User::factory()->create();
        $notif = UserNotification::factory()->unread()->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->post(route('me.notifications.read', $notif->id))
            ->assertRedirect();

        $this->assertNotNull($notif->fresh()->read_at);
    }

    public function test_user_can_mark_all_read(): void
    {
        $user = User::factory()->create();
        UserNotification::factory()->count(3)->unread()->create(['user_id' => $user->id]);

        $this->actingAs($user)->post(route('me.notifications.read-all'))->assertRedirect();

        $unread = UserNotification::where('user_id', $user->id)->whereNull('read_at')->count();
        $this->assertSame(0, $unread);
    }

    public function test_user_cannot_read_another_users_notification(): void
    {
        $attacker = User::factory()->create();
        $victim = User::factory()->create();
        $notif = UserNotification::factory()->unread()->create(['user_id' => $victim->id]);

        // Attacker attempts to mark the victim's notification read (IDOR attempt).
        $this->actingAs($attacker)
            ->post(route('me.notifications.read', $notif->id))
            ->assertRedirect();

        // Victim's notification must remain unread.
        $this->assertNull($notif->fresh()->read_at);
    }

    public function test_inbox_page_is_accessible_and_owned_by_current_user(): void
    {
        $user = User::factory()->create();
        UserNotification::factory()->count(2)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get(route('me.notifications.index'));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Notifications/Index')
                ->has('notifications.data', 2)
            );
    }

    public function test_prune_only_deletes_old_read_notifications(): void
    {
        $user = User::factory()->create();

        // Old + read → pruned.
        $oldRead = UserNotification::factory()->create([
            'user_id' => $user->id,
            'read_at' => Carbon::now()->subDays(120),
        ]);

        // Old + unread → PRESERVED (never silently delete unseen).
        $oldUnread = UserNotification::factory()->unread()->create([
            'user_id' => $user->id,
            'created_at' => Carbon::now()->subDays(120),
        ]);

        // Recent + read → preserved.
        $recentRead = UserNotification::factory()->create([
            'user_id' => $user->id,
            'read_at' => Carbon::now()->subDays(5),
        ]);

        $this->artisan('notifications:prune', ['--days' => 90])->assertExitCode(0);

        $this->assertDatabaseMissing('user_notifications', ['id' => $oldRead->id]);
        $this->assertDatabaseHas('user_notifications', ['id' => $oldUnread->id]);
        $this->assertDatabaseHas('user_notifications', ['id' => $recentRead->id]);
    }
}
