<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Attendance;
use App\Models\ChessClass;
use App\Models\ClassSession;
use App\Models\Invoice;
use App\Models\Package;
use App\Models\Room;
use App\Models\Student;
use App\Models\StudentParent;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Admin User
        $admin = User::query()->updateOrCreate(
            ['email' => env('APP_ADMIN_EMAIL', 'admin@xchess-academy-os.test')],
            [
                'name' => env('APP_ADMIN_NAME', 'Admin'),
                'password' => Hash::make(env('APP_ADMIN_PASSWORD', 'password')),
                'email_verified_at' => now(),
                'role' => UserRole::Admin->value,
            ],
        );

        // 2. Operations & Finance Staff Users (2 records)
        User::query()->firstOrCreate(
            ['email' => 'ops@xchess-academy-os.test'],
            [
                'name' => 'Ops Officer Sarah',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role' => UserRole::Ops->value,
            ]
        );
        User::query()->firstOrCreate(
            ['email' => 'finance@xchess-academy-os.test'],
            [
                'name' => 'Finance Executive David',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role' => UserRole::Finance->value,
            ]
        );

        // 3. Coaches (10 records)
        $coachNames = [
            'Coach Magnus Carlsen',
            'Coach Hikaru Nakamura',
            'Coach Fabiano Caruana',
            'Coach Ding Liren',
            'Coach Alireza Firouzja',
            'Coach Wesley So',
            'Coach Anish Giri',
            'Coach Viswanathan Anand',
            'Coach Judit Polgar',
            'Coach Hou Yifan',
        ];

        $coaches = collect();
        foreach ($coachNames as $index => $name) {
            $email = 'coach'.($index + 1).'@xchess-academy-os.test';
            $coach = User::query()->updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'role' => UserRole::Coach->value,
                ]
            );
            $coaches->push($coach);
        }

        // 4. Packages (10 records)
        $packageData = [
            ['title' => 'Pawn Beginners', 'monthly_fee' => 120.00, 'coach_rate_per_session' => 40.00, 'sessions_per_month' => 4],
            ['title' => 'Knight Intermediate', 'monthly_fee' => 160.00, 'coach_rate_per_session' => 50.00, 'sessions_per_month' => 4],
            ['title' => 'Bishop Advanced', 'monthly_fee' => 200.00, 'coach_rate_per_session' => 60.00, 'sessions_per_month' => 4],
            ['title' => 'Rook Elite', 'monthly_fee' => 250.00, 'coach_rate_per_session' => 75.00, 'sessions_per_month' => 4],
            ['title' => 'Queen Master Class', 'monthly_fee' => 320.00, 'coach_rate_per_session' => 90.00, 'sessions_per_month' => 8],
            ['title' => 'King Grandmaster', 'monthly_fee' => 400.00, 'coach_rate_per_session' => 110.00, 'sessions_per_month' => 8],
            ['title' => 'Private 1-on-1 Intensive', 'monthly_fee' => 450.00, 'coach_rate_per_session' => 120.00, 'sessions_per_month' => 4],
            ['title' => 'Speed & Tactics Lab', 'monthly_fee' => 140.00, 'coach_rate_per_session' => 45.00, 'sessions_per_month' => 4],
            ['title' => 'Endgame Mastery', 'monthly_fee' => 180.00, 'coach_rate_per_session' => 55.00, 'sessions_per_month' => 4],
            ['title' => 'Opening Repertoire Workshop', 'monthly_fee' => 210.00, 'coach_rate_per_session' => 65.00, 'sessions_per_month' => 4],
        ];

        $packages = collect();
        foreach ($packageData as $data) {
            $package = Package::query()->updateOrCreate(
                ['title' => $data['title']],
                $data
            );
            $packages->push($package);
        }

        // 5. Rooms (10 records)
        $roomData = [
            ['name' => 'Kota Bharu Room A', 'capacity' => 15, 'mode' => 'physical', 'location' => 'Kota Bharu', 'platform' => null, 'account_email' => null],
            ['name' => 'Kota Bharu Room B', 'capacity' => 12, 'mode' => 'physical', 'location' => 'Kota Bharu', 'platform' => null, 'account_email' => null],
            ['name' => 'Melaka Room 1', 'capacity' => 20, 'mode' => 'physical', 'location' => 'Melaka Tengah', 'platform' => null, 'account_email' => null],
            ['name' => 'Melaka Room 2', 'capacity' => 15, 'mode' => 'physical', 'location' => 'Melaka Tengah', 'platform' => null, 'account_email' => null],
            ['name' => 'Training Center Alpha', 'capacity' => 25, 'mode' => 'physical', 'location' => 'Kota Bharu', 'platform' => null, 'account_email' => null],
            ['name' => 'Training Center Beta', 'capacity' => 18, 'mode' => 'physical', 'location' => 'Melaka Tengah', 'platform' => null, 'account_email' => null],
            ['name' => 'Online Zoom Room 1', 'capacity' => 30, 'mode' => 'online', 'location' => null, 'platform' => 'zoom', 'account_email' => 'zoom1@xchess-academy.test'],
            ['name' => 'Online Zoom Room 2', 'capacity' => 30, 'mode' => 'online', 'location' => null, 'platform' => 'zoom', 'account_email' => 'zoom2@xchess-academy.test'],
            ['name' => 'Online Meet Room A', 'capacity' => 25, 'mode' => 'online', 'location' => null, 'platform' => 'google_meet', 'account_email' => 'meetA@xchess-academy.test'],
            ['name' => 'Online Meet Room B', 'capacity' => 25, 'mode' => 'online', 'location' => null, 'platform' => 'google_meet', 'account_email' => 'meetB@xchess-academy.test'],
        ];

        $rooms = collect();
        foreach ($roomData as $data) {
            $room = Room::query()->updateOrCreate(
                ['name' => $data['name']],
                $data
            );
            $rooms->push($room);
        }

        // 6. Parents (10 records)
        $parentNames = [
            'Ahmad Razak', 'Siti Aminah', 'Tan Kah Hock', 'Subramaniam Pillay', 'Lee Wei Ming',
            'Fatimah Zahra', 'Chong Chee Keong', 'Muthusamy K', 'Zulkifli Hassan', 'Norfazilah Binti Ali',
        ];

        $parents = collect();
        foreach ($parentNames as $i => $pName) {
            $email = 'parent'.($i + 1).'@xchess-academy-os.test';
            $parent = StudentParent::query()->updateOrCreate(
                ['email' => $email],
                [
                    'name' => $pName,
                    'phone' => '+601'.rand(10000000, 99999999),
                    'unique_access_token' => Str::uuid()->toString(),
                ]
            );
            $parents->push($parent);
        }

        // 7. Students (10 records)
        $studentNames = [
            'Adam Ahmad', 'Nur Aisyah', 'Kevin Tan', 'Divya Subramaniam', 'Chloe Lee',
            'Amir Zulkifli', 'Jason Chong', 'Kavitha Muthusamy', 'Ibrahim Razak', 'Farah Aminah',
        ];
        $levels = ['Beginner', 'Intermediate', 'Advanced', 'Master'];

        $students = collect();
        foreach ($studentNames as $i => $sName) {
            $studentUid = 'STU-'.(1001 + $i);
            $student = Student::query()->updateOrCreate(
                ['student_uid' => $studentUid],
                [
                    'name' => $sName,
                    'parent_id' => $parents[$i]->id,
                    'status' => 'Active',
                    'current_level' => $levels[$i % count($levels)],
                    'recurring_discount' => $i % 3 === 0 ? 10.00 : 0.00,
                ]
            );
            $students->push($student);
        }

        // 8. Classes (10 records)
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        $classes = collect();

        for ($i = 0; $i < 10; $i++) {
            $class = ChessClass::query()->updateOrCreate(
                ['uid' => 'CLS-XCHESS0'.($i + 1)],
                [
                    'coach_id' => $coaches[$i]->id,
                    'package_id' => $packages[$i]->id,
                    'room_id' => $rooms[$i]->id,
                    'status' => 'Active',
                    'mode' => $rooms[$i]->mode === 'online' ? 'Online' : 'Physical',
                    'day' => $days[$i % count($days)],
                    'start_time' => sprintf('%02d:00', 9 + ($i % 8)),
                    'end_time' => sprintf('%02d:00', 10 + ($i % 8)),
                    'sessions_per_month' => $packages[$i]->sessions_per_month,
                ]
            );

            // Enroll 2-3 students in each class
            $enrolledStudents = $students->slice($i % 8, 3);
            $class->students()->sync($enrolledStudents->pluck('id'));

            $classes->push($class);

            // Create 4 Class Sessions for current month
            for ($s = 1; $s <= 4; $s++) {
                $sessionDate = now()->startOfMonth()->addDays(($s - 1) * 7 + $i);
                $session = ClassSession::query()->updateOrCreate(
                    [
                        'class_id' => $class->id,
                        'session_date' => $sessionDate->toDateString(),
                    ],
                    [
                        'coach_id' => $coaches[$i]->id,
                        'topic' => 'Tactics & Endgame Analysis - Lesson '.$s,
                        'notes' => 'Session delivered successfully with full attendance.',
                    ]
                );

                // Create attendance records for past sessions
                if ($sessionDate->isPast()) {
                    foreach ($enrolledStudents as $stu) {
                        Attendance::query()->updateOrCreate(
                            [
                                'class_id' => $class->id,
                                'student_id' => $stu->id,
                                'attendance_date' => $sessionDate->toDateString(),
                            ],
                            [
                                'is_present' => true,
                            ]
                        );
                    }
                }
            }
        }

        // 9. Invoices (10 records)
        $statuses = ['Pending', 'Paid', 'Paid', 'Pending', 'Partial', 'Overdue', 'Paid', 'Pending', 'Paid', 'Draft'];
        for ($i = 0; $i < 10; $i++) {
            $student = $students[$i];
            $baseAmount = $packages[$i]->monthly_fee;
            $discount = $student->recurring_discount;
            $totalAmount = max(0, $baseAmount - $discount);

            Invoice::query()->updateOrCreate(
                [
                    'student_id' => $student->id,
                    'month_year' => now()->format('Y-m'),
                ],
                [
                    'base_amount' => $baseAmount,
                    'tax_amount' => 0.00,
                    'recurring_discount_val' => $discount,
                    'manual_adjustment' => 0.00,
                    'total_amount' => $totalAmount,
                    'status' => $statuses[$i],
                    'due_date' => now()->startOfMonth()->addDays(15)->toDateString(),
                    'notification_sent' => true,
                ]
            );
        }

        // 10. Operational Tasks (10 records)
        $taskTitles = [
            ['title' => 'Prepare Kota Bharu room materials for Saturday session', 'department' => 'Ops', 'priority' => 'High'],
            ['title' => 'Verify parent payment receipts for July invoices', 'department' => 'Finance', 'priority' => 'High'],
            ['title' => 'Follow up with Coach Magnus on class syllabus update', 'department' => 'Coaching', 'priority' => 'Medium'],
            ['title' => 'Setup Zoom link integration for Online Meet Room A', 'department' => 'Ops', 'priority' => 'Medium'],
            ['title' => 'Review monthly coach payroll calculations', 'department' => 'Finance', 'priority' => 'High'],
            ['title' => 'Confirm student attendance report for June', 'department' => 'Ops', 'priority' => 'Low'],
            ['title' => 'Audit equipment in Melaka Room 1', 'department' => 'Ops', 'priority' => 'Low'],
            ['title' => 'Send reminder notifications for overdue invoices', 'department' => 'Finance', 'priority' => 'High'],
            ['title' => 'Onboard 2 new intermediate students', 'department' => 'Coaching', 'priority' => 'Medium'],
            ['title' => 'Prepare quarterly academy performance report', 'department' => 'Finance', 'priority' => 'Medium'],
        ];

        foreach ($taskTitles as $i => $item) {
            Task::query()->updateOrCreate(
                ['title' => $item['title']],
                [
                    'user_id' => $admin->id,
                    'department' => $item['department'],
                    'status' => $i % 3 === 0 ? 'Completed' : ($i % 2 === 0 ? 'In Progress' : 'Pending'),
                    'priority' => $item['priority'],
                ]
            );
        }
    }
}
