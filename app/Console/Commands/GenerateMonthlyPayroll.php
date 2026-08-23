<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\Attendance;
use App\Models\Payroll;
use App\Models\User;
use App\Services\Notifications\InAppNotifier;
use Carbon\Carbon;
use Illuminate\Console\Command;

class GenerateMonthlyPayroll extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payroll:generate-monthly {month? : The month to generate payroll for (YYYY-MM)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate monthly payroll records for coaches based on delivered sessions';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $monthInput = $this->argument('month') ?? Carbon::now()->subMonth()->format('Y-m');
        $startOfMonth = Carbon::createFromFormat('Y-m', $monthInput)->startOfMonth();
        $endOfMonth = Carbon::createFromFormat('Y-m', $monthInput)->endOfMonth();

        $this->info("Generating payroll for {$monthInput}...");

        $coaches = User::coaches()->get();

        foreach ($coaches as $coach) {
            $this->info("Processing coach: {$coach->name}");

            // Get distinct (class_id, attendance_date) session pairs delivered by this coach in the given month.
            // Group by class so we can look up each class's package rate.
            $sessions = Attendance::query()
                ->whereHas('class', function ($query) use ($coach) {
                    $query->where('coach_id', $coach->id);
                })
                ->whereBetween('attendance_date', [$startOfMonth->format('Y-m-d'), $endOfMonth->format('Y-m-d')])
                ->select('class_id', 'attendance_date')
                ->distinct()
                ->with('class.package')
                ->get();

            if ($sessions->isEmpty()) {
                $this->info('  - No delivered sessions found.');

                continue;
            }

            // Calculate total pay: sum each session's package coach_rate_per_session.
            // If no package rate is set, the session contributes 0.
            $totalAmount = $sessions->sum(function ($session) {
                return (float) ($session->class?->package?->coach_rate_per_session ?? 0);
            });

            $sessionCount = $sessions->count();

            // Store the average rate for display purposes (total / sessions).
            $averageRate = $sessionCount > 0 ? round($totalAmount / $sessionCount, 2) : 0;

            $payroll = Payroll::updateOrCreate(
                [
                    'coach_id' => $coach->id,
                    'month_year' => $monthInput,
                ],
                [
                    'total_sessions' => $sessionCount,
                    'base_rate' => $averageRate,
                    'total_amount' => $totalAmount,
                    'status' => 'Draft',
                    'generated_at' => now(),
                ]
            );

            $this->info("  - Generated payroll: {$sessionCount} sessions, RM {$totalAmount}");

            app(InAppNotifier::class)->notify(
                $coach,
                'payroll_ready',
                "Payroll ready for {$monthInput}",
                "Your payroll for {$monthInput} has been generated: {$sessionCount} sessions, RM {$totalAmount}.",
                route('coach.payrolls.index'),
                ['coach_id' => $coach->id, 'month_year' => $monthInput, 'payroll_id' => $payroll->id],
                "payroll_ready:{$coach->id}:{$monthInput}",
            );

            // One admin summary per month (idempotent across coaches via dedup).
            app(InAppNotifier::class)->notifyRoles(
                [UserRole::Admin],
                'payroll_ready',
                "Payroll generated for {$monthInput}",
                "Monthly payroll has been generated for {$monthInput}. Review and approve.",
                route('admin.payrolls.index'),
                ['month_year' => $monthInput],
                "payroll_ready_admin:{$monthInput}",
                null,
                false,
            );
        }

        $this->info('Payroll generation completed.');
    }
}
