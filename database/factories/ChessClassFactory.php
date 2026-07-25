<?php

namespace Database\Factories;

use App\Models\ChessClass;
use App\Models\Package;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ChessClass>
 */
class ChessClassFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'coach_id' => User::factory(),
            'package_id' => Package::factory(),
            'status' => 'Active',
            'mode' => $this->faker->randomElement(['Physical', 'Online']),
            'day' => $this->faker->randomElement(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
            'start_time' => '09:00',
            'end_time' => '10:00',
            'room_id' => Room::factory(),
            'sessions_per_month' => $this->faker->numberBetween(4, 12),
        ];
    }
}
