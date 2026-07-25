<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'is_coach')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('is_coach')->default(false)->after('role');
            });

            // Set is_coach = true for any existing user with role 'Coach'
            DB::table('users')->where('role', 'Coach')->update(['is_coach' => true]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('users', 'is_coach')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('is_coach');
            });
        }
    }
};
