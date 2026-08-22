<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\InvoiceAdjustment;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InvoiceAdjustment>
 */
class InvoiceAdjustmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'type' => $this->faker->randomElement(['credit', 'charge']),
            'amount' => $this->faker->randomFloat(2, 5, 100),
            'reason' => $this->faker->sentence(),
            'status' => 'pending',
        ];
    }

    public function credit(): static
    {
        return $this->state(fn () => ['type' => 'credit']);
    }

    public function charge(): static
    {
        return $this->state(fn () => ['type' => 'charge']);
    }

    public function applied(): static
    {
        return $this->state(fn () => ['status' => 'applied']);
    }
}
