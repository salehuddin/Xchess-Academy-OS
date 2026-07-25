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
            $table->string('uid')->unique()->after('id');
            $table->string('status')->default('Pending')->after('uid');
            $table->string('mode')->after('status');
            $table->string('day')->after('package_id');
            $table->time('start_time')->after('day');
            $table->time('end_time')->after('start_time');
            $table->foreignId('room_id')->nullable()->constrained('rooms')->nullOnDelete()->after('end_time');
            $table->integer('sessions_per_month')->nullable()->after('room_id');
            $table->string('zoom_link')->nullable()->after('sessions_per_month');
            $table->string('meeting_id')->nullable()->after('zoom_link');
            $table->date('link_expiry')->nullable()->after('meeting_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->dropForeign(['room_id']);
            $table->dropColumn([
                'uid',
                'status',
                'mode',
                'day',
                'start_time',
                'end_time',
                'room_id',
                'sessions_per_month',
                'zoom_link',
                'meeting_id',
                'link_expiry',
            ]);
        });
    }
};
