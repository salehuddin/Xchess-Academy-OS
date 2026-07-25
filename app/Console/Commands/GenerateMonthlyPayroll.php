<?php

namespace App\Console\Commands;

use App\Models\Attendance;
use App\Models\Payroll;
use App\Models\User;
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
    public function handle()
    {
        $monthInput = $this->argument('month') ?? Carbon::now()->subMonth()->format('Y-m');
        $startOfMonth = Carbon::createFromFormat('Y-m', $monthInput)->startOfMonth();
        $endOfMonth = Carbon::createFromFormat('Y-m', $monthInput)->endOfMonth();

        $this->info("Generating payroll for {$monthInput}...");

        $coaches = User::coaches()->get();

        foreach ($coaches as $coach) {
            $this->info("Processing coach: {$coach->name}");

            // Find sessions delivered by this coach in the given month
            // We count distinct (class_id, attendance_date) pairs from the attendance table
            // where the class belongs to this coach
            $sessionCount = Attendance::query()
                ->whereHas('class', function ($query) use ($coach) {
                    $query->where('coach_id', $coach->id);
                })
                ->whereBetween('attendance_date', [$startOfMonth->format('Y-m-d'), $endOfMonth->format('Y-m-d')])
                ->select('class_id', 'attendance_date')
                ->distinct()
                ->get()
                ->count();

            if ($sessionCount > 0) {
                $hourlyRate = $coach->hourly_rate ?? 0;
                $totalAmount = $sessionCount * $hourlyRate;

                Payroll::updateOrCreate(
                    [
                        'coach_id' => $coach->id,
                        'month_year' => $monthInput,
                    ],
                    [
                        'total_sessions' => $sessionCount,
                        'base_rate' => $hourlyRate,
                        'total_amount' => $totalAmount,
                        'status' => 'Draft',
                        'generated_at' => now(),
                    ]
                );

                $this->info("  - Generated payroll: {$sessionCount} sessions, \${$totalAmount}");
            } else {
                $this->info('  - No delivered sessions found.');
            }
        }

        $this->info('Payroll generation completed.');
    }
}
