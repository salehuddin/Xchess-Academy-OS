<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Drop schedule_id from attendances
        Schema::table('attendances', function (Blueprint $table) {
            // Check if column exists before dropping to avoid errors if run multiple times or in specific states
            if (Schema::hasColumn('attendances', 'schedule_id')) {
                // Drop foreign key first.
                // Note: The index name usually follows table_column_foreign convention.
                // If we are not sure about the index name, we can try to drop it by array.
                // Laravel handles this if we pass the array ['schedule_id'].
                $table->dropForeign(['schedule_id']);
                $table->dropColumn('schedule_id');
            }
        });

        // 2. Drop class_schedules table
        Schema::dropIfExists('class_schedules');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Recreate class_schedules table
        Schema::create('class_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('room_id')->constrained('rooms')->cascadeOnDelete();
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->boolean('is_delivered')->default(false);
            $table->timestamps();
        });

        // 2. Add schedule_id back to attendances
        Schema::table('attendances', function (Blueprint $table) {
            $table->foreignId('schedule_id')->nullable()->constrained('class_schedules')->cascadeOnDelete();
        });
    }
};
