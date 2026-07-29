<?php

namespace Database\Factories;

use App\Models\SiteAnnouncement;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SiteAnnouncement>
 */
class SiteAnnouncementFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(),
            'body' => '<p>'.$this->faker->paragraph().'</p>',
            'type' => $this->faker->randomElement(['info', 'warning', 'success']),
            'is_active' => true,
            'published_at' => $this->faker->optional()->dateTimeThisMonth(),
            'expires_at' => null,
            'created_by' => User::factory(),
        ];
    }
}
