<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\Attendance;
use App\Models\ClassSession;
use App\Services\Notifications\InAppNotifier;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class RemindPendingAttendance extends Command
{
    protected $signature = 'attendance:remind-pending {--date= : The date to check (YYYY-MM-DD)}';

    protected $description = 'Notify coaches and staff about today\'s sessions with no attendance logged';

    public function handle(): int
    {
        $date = $this->option('date')
            ? Carbon::parse($this->option('date'))->startOfDay()
            : Carbon::today();

        $dateStr = $date->format('Y-m-d');

        $sessions = ClassSession::query()
            ->with('class.coach')
            ->whereDate('session_date', $date)
            ->get();

        if ($sessions->isEmpty()) {
            $this->info('No sessions scheduled for '.$dateStr.'.');

            return self::SUCCESS;
        }

        $notifier = app(InAppNotifier::class);
        $reminded = 0;

        foreach ($sessions as $session) {
            $class = $session->class;
            $classId = $session->class_id;

            $hasAttendance = Attendance::query()
                ->where('class_id', $classId)
                ->whereDate('attendance_date', $date)
                ->exists();

            if ($hasAttendance) {
                continue;
            }

            $className = $class?->name ?? 'Class #'.$classId;
            $coach = $session->coach ?? $class?->coach;

            if ($coach) {
                $notifier->notify(
                    $coach,
                    'attendance_pending',
                    "Attendance pending: {$className}",
                    "Today's session ({$dateStr}) has no attendance logged yet.",
                    route('coach.attendances.show', [$classId, $dateStr]),
                    ['class_id' => $classId, 'session_id' => $session->id, 'date' => $dateStr],
                    "attendance_pending:{$classId}:{$dateStr}",
                );
            }

            $notifier->notifyRoles(
                [UserRole::Ops],
                'attendance_pending',
                "Attendance not logged — {$className}",
                "Attendance for today's session ({$dateStr}) is still pending.",
                route('admin.attendances.index'),
                ['class_id' => $classId, 'session_id' => $session->id, 'date' => $dateStr],
                "attendance_pending_admin:{$classId}:{$dateStr}",
                null,
                true,
            );

            $reminded++;
        }

        $this->info("Reminded {$reminded} session(s) with pending attendance for {$dateStr}.");

        return self::SUCCESS;
    }
}
