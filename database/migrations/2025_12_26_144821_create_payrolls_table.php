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
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coach_id')->constrained('users')->onDelete('cascade');
            $table->string('month_year'); // Format: YYYY-MM
            $table->integer('total_sessions')->default(0);
            $table->decimal('base_rate', 10, 2); // Snapshot of rate at generation
            $table->decimal('total_amount', 10, 2);
            $table->string('status')->default('Draft'); // Draft, Processed, Paid
            $table->timestamp('generated_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payrolls');
    }
};
