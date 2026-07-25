<?php

namespace Database\Factories;

use App\Models\Room;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Room>
 */
class RoomFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $mode = $this->faker->randomElement(['physical', 'online']);

        $platform = $mode === 'online'
            ? $this->faker->randomElement(['zoom', 'google_meet'])
            : null;

        return [
            'name' => $this->faker->word.' Room',
            'capacity' => $this->faker->numberBetween(10, 30),
            'mode' => $mode,
            'location' => $mode === 'physical'
                ? $this->faker->randomElement(['Kota Bharu', 'Melaka Tengah'])
                : null,
            'platform' => $platform,
            'account_email' => $mode === 'online'
                ? $this->faker->unique()->safeEmail()
                : null,
        ];
    }
}
