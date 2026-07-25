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
        Schema::table('classes', function (Blueprint $table) {
            $table->json('schedules')->nullable()->after('end_time');
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->foreignId('class_id')->nullable()->after('id')->constrained('classes')->cascadeOnDelete();
            $table->date('attendance_date')->nullable()->after('class_id');

            // Make schedule_id nullable for transition
            $table->unsignedBigInteger('schedule_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->dropColumn('schedules');
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->dropForeign(['class_id']);
            $table->dropColumn(['class_id', 'attendance_date']);

            // Revert schedule_id to not nullable (careful if nulls exist)
            // We can't easily revert nullable to not nullable if data exists, so we might skip this part or handle with care.
            // For now, let's just leave it nullable in down() or attempt to revert if no nulls.
            $table->unsignedBigInteger('schedule_id')->nullable(false)->change();
        });
    }
};
