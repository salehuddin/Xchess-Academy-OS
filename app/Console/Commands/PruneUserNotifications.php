<?php

namespace App\Console\Commands;

use App\Models\Setting;
use App\Models\UserNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class PruneUserNotifications extends Command
{
    protected $signature = 'notifications:prune {--days= : Retention window in days (default: 90)}';

    protected $description = 'Delete read in-app notifications older than the retention window';

    public function handle(): int
    {
        $days = (int) ($this->option('days') ?? Setting::get('notifications_retention_days', 90));
        if ($days <= 0) {
            $this->info('Pruning disabled (retention days <= 0).');

            return self::SUCCESS;
        }

        $cutoff = Carbon::now()->subDays($days);

        // Only ever prune notifications the user has actually seen — unread
        // rows are kept indefinitely so nothing important is silently lost.
        $baseQuery = UserNotification::query()
            ->whereNotNull('read_at')
            ->where('read_at', '<', $cutoff);

        $total = (clone $baseQuery)->count();
        if ($total === 0) {
            $this->info('No read notifications older than '.$days.' days to prune.');

            return self::SUCCESS;
        }

        $this->info("Pruning {$total} read notification(s) older than {$days} days...");

        // Chunk the deletes so a large backlog never holds a long lock.
        $chunkSize = 1000;
        $deleted = 0;

        while (true) {
            $ids = (clone $baseQuery)->limit($chunkSize)->pluck('id');
            if ($ids->isEmpty()) {
                break;
            }

            UserNotification::query()->whereIn('id', $ids->all())->delete();
            $deleted += $ids->count();
        }

        $this->info("Pruned {$deleted} read notification(s).");

        return self::SUCCESS;
    }
}
