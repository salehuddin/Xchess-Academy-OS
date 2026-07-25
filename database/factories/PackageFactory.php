<?php

namespace Database\Factories;

use App\Models\Package;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Package>
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
            'title' => $this->faker->word.' Package',
            'monthly_fee' => $this->faker->randomFloat(2, 50, 200),
            'coach_rate_per_session' => $this->faker->randomFloat(2, 10, 100),
            'sessions_per_month' => 4,
        ];
    }
}
