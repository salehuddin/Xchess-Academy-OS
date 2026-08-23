<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\CoachProfile;
use App\Models\Student;
use App\Models\StudentParent;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProductionDemoSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Default password for every seeded login account.
     */
    private const PASSWORD = 'Password123!';

    public function run(): void
    {
        $this->command->info('Seeding production demo accounts...');

        $this->seedAdmins();
        $this->seedOpsStaff();
        $this->seedFinanceStaff();
        $this->seedCoaches();
        $parents = $this->seedParents();
        $this->seedStudents($parents);

        $this->command->info('Done. All login accounts use password: '.self::PASSWORD);
    }

    private function createUser(string $name, string $email, UserRole $role, bool $isCoach = false): User
    {
        return User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make(self::PASSWORD),
                'email_verified_at' => now(),
                'role' => $role->value,
                'is_coach' => $isCoach,
            ],
        );
    }

    private function seedAdmins(): void
    {
        $admins = [
            ['Demo Admin', 'demo-admin@example.com'],
            ['Demo Admin 2', 'demo-admin2@example.com'],
        ];

        foreach ($admins as [$name, $email]) {
            $this->createUser($name, $email, UserRole::Admin);
            $this->command->line("  Admin: {$email}");
        }
    }

    private function seedOpsStaff(): void
    {
        $staff = [
            ['Ops Officer Aiman', 'ops1@example.com'],
            ['Ops Officer Mei Ling', 'ops2@example.com'],
            ['Ops Officer Raj', 'ops3@example.com'],
        ];

        foreach ($staff as [$name, $email]) {
            $this->createUser($name, $email, UserRole::Ops);
            $this->command->line("  Ops: {$email}");
        }
    }

    private function seedFinanceStaff(): void
    {
        $staff = [
            ['Finance Executive Nurul', 'finance1@example.com'],
            ['Finance Executive Wei Jie', 'finance2@example.com'],
            ['Finance Executive Kavitha', 'finance3@example.com'],
        ];

        foreach ($staff as [$name, $email]) {
            $this->createUser($name, $email, UserRole::Finance);
            $this->command->line("  Finance: {$email}");
        }
    }

    private function seedCoaches(): void
    {
        $coaches = [
            ['Coach Arif Hassan', 'coach1@example.com', 'Master', 120.00],
            ['Coach Li Na', 'coach2@example.com', 'Advanced', 90.00],
            ['Coach Danial Iskandar', 'coach3@example.com', 'Intermediate', 60.00],
            ['Coach Priya Nair', 'coach4@example.com', 'Advanced', 85.00],
            ['Coach Yusuf Rahman', 'coach5@example.com', 'Intermediate', 55.00],
            ['Coach Siti Mariam', 'coach6@example.com', 'Beginner', 40.00],
        ];

        $banks = ['Maybank', 'CIMB', 'Public Bank', 'Hong Leong Bank', 'RHB Bank', 'Bank Islam'];

        foreach ($coaches as $index => [$name, $email, $level, $hourlyRate]) {
            $coach = $this->createUser($name, $email, UserRole::Coach, true);

            CoachProfile::query()->updateOrCreate(
                ['user_id' => $coach->id],
                [
                    'nric' => '83091'.str_pad((string) rand(0, 99), 2, '0', STR_PAD_LEFT).'00'.str_pad((string) rand(0, 99), 2, '0', STR_PAD_LEFT),
                    'phone' => '+601'.rand(10000000, 99999999),
                    'bank_name' => $banks[$index],
                    'bank_account_name' => $name,
                    'bank_account_number' => str_pad((string) rand(0, 9999999999), 10, '0', STR_PAD_LEFT),
                    'level' => $level,
                    'hourly_rate' => $hourlyRate,
                    'availability' => [
                        ['day' => 'Monday', 'start' => '09:00', 'end' => '17:00'],
                        ['day' => 'Wednesday', 'start' => '09:00', 'end' => '17:00'],
                        ['day' => 'Saturday', 'start' => '09:00', 'end' => '13:00'],
                    ],
                ],
            );

            $this->command->line("  Coach: {$email}");
        }
    }

    private function seedParents()
    {
        $parentNames = [
            'Ahmad Faizal', 'Nur Hidayah', 'Lim Chee Seng', 'Ganesan Subramaniam', 'Rosnah Abdullah',
            'Chong Wei Keat', 'Tan Mei Yee', 'Muhammad Hafiz', 'Faridah Wahab', 'Kumaravelu M',
            'Zainal Abidin', 'Lau Siew Fun', 'Harith Daniel', 'Saraswathy Devi', 'Ong Kim Soon',
        ];

        $parents = collect();

        foreach ($parentNames as $index => $name) {
            $email = 'parent'.($index + 1).'@example.com';

            $parent = StudentParent::query()->updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'phone' => '+601'.rand(10000000, 99999999),
                    'unique_access_token' => Str::uuid()->toString(),
                ],
            );

            $parents->push($parent);
            $this->command->line("  Parent: {$email}");
        }

        return $parents;
    }

    private function seedStudents($parents): void
    {
        $studentNames = [
            'Adam Ahmad Faizal', 'Aisyah Nur Hidayah', 'Bryan Lim', 'Divya Ganesan', 'Aiman Rosnah',
            'Justin Chong', 'Jia Yi Tan', 'Hakim Muhammad', 'Amirah Faridah', 'Kavish Kumaravelu',
            'Zara Zainal', 'Melissa Lau', 'Danial Harith', 'Santhiya Saraswathy', 'Ethan Ong',
            'Haris Ahmad Faizal', 'Nadia Nur Hidayah', 'Wei Han Chong', 'Priyanka Ganesan', 'Liyana Rosnah',
        ];

        $levels = ['Beginner', 'Intermediate', 'Advanced', 'Master'];
        $languages = ['Bahasa Melayu', 'English', 'Mandarin', 'Tamil'];
        $ages = [9, 11, 7, 13, 8, 10, 12, 6, 14, 15, 10, 8, 11, 7, 12, 6, 13, 9, 14, 10];

        foreach ($studentNames as $index => $name) {
            // Spread 20 students across 15 parents: parents 1-5 each get a 2nd child.
            $parentIndex = $index < 15 ? $index : $index - 15;
            $parent = $parents[$parentIndex];

            $uid = 'STU-'.(1001 + $index);

            Student::query()->updateOrCreate(
                ['student_uid' => $uid],
                [
                    'name' => $name,
                    'nric_passport' => strtoupper(Str::random(2)).str_pad((string) rand(0, 999999), 6, '0', STR_PAD_LEFT),
                    'date_of_birth' => now()->subYears($ages[$index])->subMonths($index % 12)->format('Y-m-d'),
                    'preferred_language' => $languages[$index % count($languages)],
                    'date_of_registration' => now()->subDays(rand(30, 365))->format('Y-m-d'),
                    'parent_id' => $parent->id,
                    'status' => 'Active',
                    'current_level' => $levels[$index % count($levels)],
                    'recurring_discount' => $index % 3 === 0 ? 10.00 : 0.00,
                ],
            );

            $this->command->line("  Student: {$uid} ({$name}) -> {$parent->email}");
        }
    }
}
