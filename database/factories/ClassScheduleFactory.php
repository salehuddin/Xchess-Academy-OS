<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ClassSchedule>
 */
class ClassScheduleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'class_id' => \App\Models\ChessClass::factory(),
            'room_id' => \App\Models\Room::factory(),
            'start_time' => now(),
            'end_time' => now()->addHour(),
            'is_delivered' => false,
        ];
    }
}
