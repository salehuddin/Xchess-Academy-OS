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
        Schema::table('students', function (Blueprint $table) {
            $table->string('nric_passport', 20)->nullable()->after('name');
            $table->string('preferred_language')->nullable()->after('nric_passport');
            $table->date('date_of_registration')->nullable()->after('status');
            $table->text('admin_notes')->nullable()->after('recurring_discount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn(['nric_passport', 'preferred_language', 'date_of_registration', 'admin_notes']);
        });
    }
};
