<?php

namespace App\Services\Notifications;

use App\Models\Invoice;
use App\Models\Notification;
use App\Models\NotificationDispatch;
use App\Models\StudentParent;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

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

    public function sendDueDispatches(Carbon $now, ?int $limit = 250): int
    {
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
        foreach ($dispatches as $dispatch) {
            $notification = $dispatch->notification;
            if (! $notification || ! $notification->is_active) {
                $dispatch->update(['status' => 'Skipped', 'sent_at' => $now]);

                continue;
            }

            try {
                $this->sendOne($dispatch);
                $dispatch->update(['status' => 'Sent', 'sent_at' => $now]);
                $sent++;
            } catch (\Throwable $e) {
                $dispatch->update([
                    'status' => 'Failed',
                    'sent_at' => $now,
                    'error' => mb_substr($e->getMessage(), 0, 1000),
                ]);
            }
        }

        return $sent;
    }

    public function markInvoicesOverdue(Carbon $today): int
    {
        $dateStr = $today->format('Y-m-d');

        return Invoice::query()
            ->whereIn('status', ['Pending', 'Partial'])
            ->whereNotNull('due_date')
            ->where('due_date', '<=', $dateStr)
            ->update(['status' => 'Overdue']);
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
