<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => env('APP_ADMIN_EMAIL', 'admin@xchess-academy-os.test')],
            [
                'name' => env('APP_ADMIN_NAME', 'Admin'),
                'password' => Hash::make(env('APP_ADMIN_PASSWORD', 'password')),
                'email_verified_at' => now(),
                'role' => UserRole::Admin->value,
            ],
        );
    }
}
