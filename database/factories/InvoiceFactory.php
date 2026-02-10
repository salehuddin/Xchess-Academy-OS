<?php

namespace Database\Factories;

use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Invoice>
 */
class InvoiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $baseAmount = $this->faker->randomFloat(2, 50, 200);
        $taxAmount = round($baseAmount * 0.1, 2);
        $totalAmount = $baseAmount + $taxAmount;

        return [
            'student_id' => Student::factory(),
            'base_amount' => $baseAmount,
            'tax_amount' => $taxAmount,
            'recurring_discount_val' => 0,
            'manual_adjustment' => 0,
            'total_amount' => $totalAmount,
            'status' => 'Draft',
            'notification_sent' => false,
            'month_year' => now()->format('Y-m'),
            'due_date' => now()->addDays(7),
        ];
    }
}
