<?php

namespace Database\Factories;

use App\Models\Student;
use App\Models\StudentParent;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Student>
 */
class StudentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_uid' => 'STU-'.$this->faker->unique()->numberBetween(1000, 9999),
            'name' => $this->faker->name(),
            'date_of_birth' => $this->faker->dateTimeBetween('-16 years', '-6 years')->format('Y-m-d'),
            'parent_id' => StudentParent::factory(),
            'status' => 'Active',
            'current_level' => 'Beginner',
            'recurring_discount' => 0,
        ];
    }
}
