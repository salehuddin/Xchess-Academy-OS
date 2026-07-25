<?php

namespace App\Services\Announcements;

use App\Models\Announcement;
use App\Models\AnnouncementDispatch;
use App\Models\StudentParent;
use App\Services\Notifications\Channels\EmailChannel;
use App\Services\Notifications\Channels\WhatsAppChannel;
use App\Services\Notifications\NotificationRenderer;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AnnouncementEngine
{
    public function sendNow(Announcement $announcement): int
    {
        if ($announcement->status === 'Sent') {
            return 0;
        }

        $recipients = $this->resolveRecipients($announcement);
        if ($recipients->isEmpty()) {
            $announcement->update(['status' => 'Sent', 'sent_at' => Carbon::now()]);

            return 0;
        }

        $now = Carbon::now();
        $queued = 0;

        foreach ($recipients as $recipient) {
            $dispatch = $this->createDispatchIfMissing($announcement, $recipient, $now);
            if (! $dispatch) {
                continue;
            }

            $queued++;
            $this->sendOne($dispatch);
        }

        $announcement->update(['status' => 'Sent', 'sent_at' => $now]);

        return $queued;
    }

    public function sendPendingDispatches(Carbon $now, ?int $limit = 500): int
    {
        $query = AnnouncementDispatch::query()
            ->where('status', 'Pending')
            ->where('scheduled_for', '<=', $now)
            ->with('announcement')
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
            $announcement = $dispatch->announcement;
            if (! $announcement) {
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

    private function resolveRecipients(Announcement $announcement)
    {
        $channel = $announcement->channel;

        $query = StudentParent::query()
            ->whereNotNull('name');

        if ($channel === 'email') {
            $query->whereNotNull('email');
        }

        if ($channel === 'whatsapp') {
            $query->whereNotNull('phone');
        }

        if ($announcement->audience === 'class') {
            $classId = (int) ($announcement->audience_meta['class_id'] ?? 0);
            if ($classId > 0) {
                $query->whereHas('students.classes', function ($q) use ($classId) {
                    $q->where('classes.id', $classId);
                });
            } else {
                return collect();
            }
        }

        return $query->select(['id', 'name', 'email', 'phone'])->get();
    }

    private function createDispatchIfMissing(Announcement $announcement, StudentParent $parent, Carbon $scheduledFor): ?AnnouncementDispatch
    {
        $recipient = $announcement->channel === 'email' ? $parent->email : $parent->phone;
        if (! $recipient) {
            return null;
        }

        return DB::transaction(function () use ($announcement, $parent, $recipient, $scheduledFor) {
            $existing = AnnouncementDispatch::query()
                ->where('announcement_id', $announcement->id)
                ->where('channel', $announcement->channel)
                ->where('recipient', $recipient)
                ->where('scheduled_for', $scheduledFor)
                ->first();

            if ($existing) {
                return null;
            }

            $context = [
                'parent_name' => $parent->name,
                'announcement_title' => $announcement->title,
            ];

            return AnnouncementDispatch::create([
                'announcement_id' => $announcement->id,
                'channel' => $announcement->channel,
                'recipient' => $recipient,
                'scheduled_for' => $scheduledFor,
                'status' => 'Pending',
                'context' => $context,
            ]);
        });
    }

    private function sendOne(AnnouncementDispatch $dispatch): void
    {
        $announcement = $dispatch->announcement;

        $renderer = new NotificationRenderer;
        $subject = $announcement->subject ? $renderer->render($announcement->subject, $dispatch->context ?? []) : null;
        $body = $renderer->render($announcement->body, $dispatch->context ?? []);

        if ($announcement->channel === 'email') {
            (new EmailChannel)->send($dispatch->recipient, $subject ?? $announcement->title, $body);
            $dispatch->update(['status' => 'Sent', 'sent_at' => Carbon::now()]);

            return;
        }

        if ($announcement->channel === 'whatsapp') {
            (new WhatsAppChannel)->send($dispatch->recipient, $body);
            $dispatch->update(['status' => 'Sent', 'sent_at' => Carbon::now()]);

            return;
        }

        throw new \RuntimeException('Unsupported channel: '.$announcement->channel);
    }
}
