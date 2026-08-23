<?php

namespace App\Services\Notifications;

use App\Enums\UserRole;
use App\Models\Invoice;
use App\Models\Notification;
use App\Models\NotificationDispatch;
use App\Models\Setting;
use App\Models\StudentParent;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class NotificationEngine
{
    public function triggerInvoiceSent(Invoice $invoice): void
    {
        $parent = $invoice->student?->parent;
        if (! $parent) {
            return;
        }

        $this->queueAndSend('invoice_sent', $invoice, $parent, Carbon::now());
    }

    public function queueOverdueForDate(Carbon $date): int
    {
        $dateStr = $date->format('Y-m-d');
        $scheduledFor = $date->copy()->startOfDay();

        $notifications = Notification::query()
            ->where('is_active', true)
            ->where('trigger', 'invoice_overdue')
            ->get();

        if ($notifications->isEmpty()) {
            return 0;
        }

        $invoices = Invoice::query()
            ->whereIn('status', ['Pending', 'Overdue', 'Partial'])
            ->whereNotNull('due_date')
            ->with(['student.parent', 'student.classes'])
            ->get();

        $queued = 0;

        foreach ($invoices as $invoice) {
            $parent = $invoice->student?->parent;
            if (! $parent) {
                continue;
            }

            foreach ($notifications as $notification) {
                if (! $this->matchesNotification($notification, $invoice, $parent)) {
                    continue;
                }

                $days = $notification->schedule['days'] ?? [];
                $days = is_array($days) ? $days : [];

                foreach ($days as $d) {
                    $offset = (int) $d;
                    $dueDate = Carbon::parse($invoice->due_date)->startOfDay();
                    $targetDate = $dueDate->copy()->addDays($offset)->format('Y-m-d');
                    if ($targetDate !== $dateStr) {
                        continue;
                    }

                    $recipient = $this->resolveRecipient($notification, $parent);
                    if (! $recipient) {
                        continue;
                    }

                    $created = $this->createDispatchIfMissing(
                        $notification,
                        $recipient,
                        $invoice,
                        $scheduledFor,
                        $this->buildContext($invoice, $parent)
                    );

                    if ($created) {
                        $queued++;
                    }
                }
            }
        }

        return $queued;
    }

    public function sendDueDispatches(Carbon $now, ?int $limit = null): int
    {
        if (! $this->notificationsEnabled()) {
            return 0;
        }

        $limit ??= (int) Setting::get('notifications_daily_limit', 250);
        $maxAttempts = (int) Setting::get('notifications_retry_attempts', 3);

        $query = NotificationDispatch::query()
            ->where('status', 'Pending')
            ->where('scheduled_for', '<=', $now)
            ->with('notification')
            ->orderBy('scheduled_for');

        if ($limit) {
            $query->limit($limit);
        }

        $dispatches = $query->get();
        if ($dispatches->isEmpty()) {
            return 0;
        }

        $sent = 0;
        $consecutiveFailures = 0;

        foreach ($dispatches as $dispatch) {
            $notification = $dispatch->notification;
            if (! $notification || ! $notification->is_active) {
                $dispatch->update(['status' => 'Skipped', 'sent_at' => $now]);

                continue;
            }

            try {
                $this->sendOne($dispatch);
                $dispatch->update([
                    'status' => 'Sent',
                    'sent_at' => $now,
                    'attempts' => $dispatch->attempts + 1,
                ]);
                $sent++;
                $consecutiveFailures = 0;
            } catch (\Throwable $e) {
                $attempts = $dispatch->attempts + 1;

                if ($attempts < $maxAttempts) {
                    $retryDelay = (int) Setting::get('notifications_retry_delay_minutes', 30);
                    $dispatch->update([
                        'status' => 'Pending',
                        'attempts' => $attempts,
                        'error' => mb_substr($e->getMessage(), 0, 1000),
                        'scheduled_for' => $now->copy()->addMinutes($retryDelay),
                    ]);
                } else {
                    $dispatch->update([
                        'status' => 'Failed',
                        'sent_at' => $now,
                        'attempts' => $attempts,
                        'error' => mb_substr($e->getMessage(), 0, 1000),
                    ]);
                }

                $consecutiveFailures++;
                if ($consecutiveFailures >= 5) {
                    $this->sendAdminAlert($consecutiveFailures);
                    $consecutiveFailures = 0;
                }
            }
        }

        return $sent;
    }

    protected function notificationsEnabled(): bool
    {
        return (bool) Setting::get('notifications_enabled', true);
    }

    protected function sendAdminAlert(int $failureCount): void
    {
        // In-app alert fires regardless of email configuration (hourly throttle).
        app(InAppNotifier::class)->notifyRoles(
            [UserRole::Admin],
            'outbound_failure_spike',
            'Notification dispatch failures detected',
            "{$failureCount} consecutive dispatch failures detected. Check the dispatch log and channel configuration.",
            route('admin.notifications.dispatches'),
            ['failure_count' => $failureCount],
            'outbound_failure_spike:'.now()->format('Y-m-d H'),
            null,
            false,
        );

        $alertEmail = Setting::get('notifications_admin_alert_email');

        if (empty($alertEmail)) {
            return;
        }

        try {
            Mail::raw(
                "Notification system alert: {$failureCount} consecutive dispatch failures detected. Please check the dispatch log and channel configuration.",
                function ($message) use ($alertEmail) {
                    $message->to($alertEmail)
                        ->subject('Notification System Alert - Consecutive Failures');
                }
            );
        } catch (\Throwable $e) {
        }
    }

    public function markInvoicesOverdue(Carbon $today): int
    {
        $dateStr = $today->format('Y-m-d');

        $ids = Invoice::query()
            ->whereIn('status', ['Pending', 'Partial'])
            ->whereNotNull('due_date')
            ->where('due_date', '<=', $dateStr)
            ->pluck('id');

        if ($ids->isEmpty()) {
            return 0;
        }

        Invoice::query()->whereIn('id', $ids)->update(['status' => 'Overdue']);

        app(InAppNotifier::class)->notifyRoles(
            [UserRole::Finance],
            'invoice_overdue',
            "{$ids->count()} invoice(s) marked overdue",
            'Invoices past their due date have been flipped to Overdue and may need follow-up.',
            route('admin.invoices.index', ['status' => 'Overdue']),
            ['invoice_ids' => $ids->values()->all(), 'date' => $dateStr],
            'invoice_overdue_summary:'.$dateStr,
        );

        return $ids->count();
    }

    private function queueAndSend(string $trigger, Invoice $invoice, StudentParent $parent, Carbon $scheduledFor): void
    {
        $notifications = Notification::query()
            ->where('is_active', true)
            ->where('trigger', $trigger)
            ->get();

        foreach ($notifications as $notification) {
            if (! $this->matchesNotification($notification, $invoice, $parent)) {
                continue;
            }

            $recipient = $this->resolveRecipient($notification, $parent);
            if (! $recipient) {
                continue;
            }

            $dispatch = $this->createDispatchIfMissing(
                $notification,
                $recipient,
                $invoice,
                $scheduledFor,
                $this->buildContext($invoice, $parent)
            );

            if ($dispatch) {
                $this->sendOne($dispatch);
                $dispatch->update(['status' => 'Sent', 'sent_at' => Carbon::now()]);
            }
        }
    }

    private function createDispatchIfMissing(
        Notification $notification,
        string $recipient,
        Invoice $invoice,
        Carbon $scheduledFor,
        array $context
    ): ?NotificationDispatch {
        return DB::transaction(function () use ($notification, $recipient, $invoice, $scheduledFor, $context) {
            $existing = NotificationDispatch::query()
                ->where('notification_id', $notification->id)
                ->where('channel', $notification->channel)
                ->where('recipient', $recipient)
                ->where('notifiable_type', Invoice::class)
                ->where('notifiable_id', $invoice->id)
                ->where('scheduled_for', $scheduledFor)
                ->first();

            if ($existing) {
                return null;
            }

            return NotificationDispatch::create([
                'notification_id' => $notification->id,
                'channel' => $notification->channel,
                'recipient' => $recipient,
                'notifiable_type' => Invoice::class,
                'notifiable_id' => $invoice->id,
                'scheduled_for' => $scheduledFor,
                'status' => 'Pending',
                'context' => $context,
            ]);
        });
    }

    private function sendOne(NotificationDispatch $dispatch): void
    {
        $notification = $dispatch->notification;
        $channel = $notification->channel;

        $renderer = new NotificationRenderer;
        $subject = $notification->subject ? $renderer->render($notification->subject, $dispatch->context ?? []) : null;
        $body = $renderer->render($notification->body, $dispatch->context ?? []);

        if ($channel === 'email') {
            (new Channels\EmailChannel)->send($dispatch->recipient, $subject ?? $notification->name, $body);

            return;
        }

        if ($channel === 'whatsapp') {
            (new Channels\WhatsAppChannel)->send($dispatch->recipient, $body);

            return;
        }

        throw new \RuntimeException('Unsupported channel: '.$channel);
    }

    private function matchesNotification(Notification $notification, Invoice $invoice, StudentParent $parent): bool
    {
        $conditions = $notification->conditions ?? [];
        $classMode = $conditions['class_mode'] ?? 'All';

        if ($classMode && $classMode !== 'All') {
            $invoiceMode = $this->inferInvoiceMode($invoice);
            if ($invoiceMode !== $classMode) {
                return false;
            }
        }

        return true;
    }

    private function inferInvoiceMode(Invoice $invoice): string
    {
        $classes = $invoice->student?->classes ?? collect();
        $modes = $classes->pluck('mode')->filter()->map(fn ($m) => strtolower((string) $m))->unique()->values();

        if ($modes->isEmpty()) {
            return 'All';
        }

        if ($modes->count() === 1) {
            $only = $modes->first();

            return $only === 'online' ? 'Online' : 'Physical';
        }

        return 'All';
    }

    private function resolveRecipient(Notification $notification, StudentParent $parent): ?string
    {
        if ($notification->channel === 'email') {
            return $parent->email ?: null;
        }

        if ($notification->channel === 'whatsapp') {
            return $parent->phone ?: null;
        }

        return null;
    }

    private function buildContext(Invoice $invoice, StudentParent $parent): array
    {
        $token = $parent->unique_access_token;
        $portalUrl = $token ? route('portal.invoice.show', [$token, $invoice->id]) : null;

        return [
            'parent_name' => $parent->name,
            'student_name' => $invoice->student?->name,
            'invoice_id' => $invoice->id,
            'invoice_month_year' => $invoice->month_year,
            'invoice_total_amount' => (string) $invoice->total_amount,
            'invoice_status' => $invoice->status,
            'invoice_due_date' => $invoice->due_date?->format('Y-m-d'),
            'portal_url' => $portalUrl,
        ];
    }
}
