<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserNotification>
 */
class UserNotificationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => $this->faker->randomElement(['task_assigned', 'invoice_overdue', 'invoice_sent', 'payroll_ready', 'attendance_pending', 'outbound_failure_spike']),
            'title' => $this->faker->sentence(),
            'body' => $this->faker->optional()->paragraph(),
            'data' => null,
            'url' => null,
            'read_at' => null,
            'dedup_key' => null,
            'actor_id' => null,
        ];
    }

    public function unread(): static
    {
        return $this->state(fn (array $attributes) => ['read_at' => null]);
    }

    public function read(): static
    {
        return $this->state(['read_at' => now()]);
    }
}
