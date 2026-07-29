<?php

namespace App\Console\Commands;

use App\Services\Notifications\NotificationEngine;
use App\Models\Setting;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class ProcessNotifications extends Command
{
    protected $signature = 'notifications:run {--date= : Process notifications for a date (YYYY-MM-DD)} {--limit=250 : Max dispatches to send}';

    protected $description = 'Mark invoices overdue and process scheduled notifications';

    public function handle(): int
    {
        $dateInput = $this->option('date');
        $date = $dateInput ? Carbon::parse($dateInput) : Carbon::today();

        $engine = new NotificationEngine;

        $overdueUpdated = $engine->markInvoicesOverdue($date);
        if ($overdueUpdated > 0) {
            $this->info("Marked {$overdueUpdated} invoice(s) as Overdue.");
        }

        $queued = $engine->queueOverdueForDate($date);
        if ($queued > 0) {
            $this->info("Queued {$queued} dispatch(es) for {$date->format('Y-m-d')}.");
        }

        $limit = (int) $this->option('limit');
        if ($limit === 250) {
            $limit = (int) Setting::get('notifications_daily_limit', 250);
        }
        $sent = $engine->sendDueDispatches(Carbon::now(), $limit);
        $this->info("Sent {$sent} dispatch(es).");

        return self::SUCCESS;
    }
}
