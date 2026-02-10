<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Package>
 */
class PackageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->word . ' Package',
            'monthly_fee' => $this->faker->randomFloat(2, 50, 200),
            'coach_rate_per_session' => $this->faker->randomFloat(2, 10, 100),
            'sessions_per_month' => 4,
        ];
    }
}
