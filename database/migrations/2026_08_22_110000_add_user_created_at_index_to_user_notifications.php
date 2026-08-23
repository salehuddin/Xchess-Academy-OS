<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_notifications', function (Blueprint $table) {
            // Covers the inbox (ORDER BY created_at DESC) and the bell's
            // "latest items" query, both filtered by user_id — avoids a
            // filesort as a single user accumulates many notifications.
            $table->index(['user_id', 'created_at'], 'user_notifications_user_created_at_index');
        });
    }

    public function down(): void
    {
        Schema::table('user_notifications', function (Blueprint $table) {
            $table->dropIndex('user_notifications_user_created_at_index');
        });
    }
};
