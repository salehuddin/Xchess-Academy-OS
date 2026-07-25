<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\ChessClass;
use App\Models\Package;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScheduleTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        // Create an admin user
        $this->admin = User::factory()->create(['role' => UserRole::Admin]);
    }

    public function test_generator_calculates_correct_dates()
    {
        // Create a package
        $package = Package::factory()->create(['sessions_per_month' => 4]);

        // Create a class on Mondays
        $class = ChessClass::factory()->create([
            'package_id' => $package->id,
            'day' => 'Monday',
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'schedules' => [],
        ]);

        // Use a known month: July 2025
        // Mondays in July 2025: 7, 14, 21, 28
        $month = '2025-07';

        $response = $this->actingAs($this->admin)->post(route('admin.schedules.store'), [
            'month' => $month,
            'package_ids' => [$package->id],
            'excluded_dates' => [],
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $class->refresh();
        $this->assertCount(4, $class->schedules);
        $this->assertEquals(['2025-07-07', '2025-07-14', '2025-07-21', '2025-07-28'], $class->schedules);
    }

    public function test_generator_respects_excluded_dates()
    {
        $package = Package::factory()->create(['sessions_per_month' => 4]);
        $class = ChessClass::factory()->create([
            'package_id' => $package->id,
            'day' => 'Monday',
            'schedules' => [],
        ]);

        // July 2025 Mondays: 7, 14, 21, 28
        // Exclude 14th
        $month = '2025-07';
        $excluded = ['2025-07-14'];

        $response = $this->actingAs($this->admin)->post(route('admin.schedules.store'), [
            'month' => $month,
            'package_ids' => [$package->id],
            'excluded_dates' => $excluded,
        ]);

        $class->refresh();
        $this->assertCount(3, $class->schedules);
        $this->assertEquals(['2025-07-07', '2025-07-21', '2025-07-28'], $class->schedules);
    }

    public function test_can_update_class_schedules_manually()
    {
        $class = ChessClass::factory()->create(['schedules' => []]);
        $newSchedules = ['2025-07-01', '2025-07-08'];

        $response = $this->actingAs($this->admin)->put(route('admin.classes.schedules.update', $class), [
            'schedules' => $newSchedules,
        ]);

        $response->assertRedirect();
        $class->refresh();
        $this->assertEquals($newSchedules, $class->schedules);
    }

    public function test_index_redirects_to_generator()
    {
        $response = $this->actingAs($this->admin)->get(route('admin.schedules.index'));
        $response->assertRedirect(route('admin.schedules.generator'));
    }
}
