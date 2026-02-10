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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->decimal('base_amount', 10, 2);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('recurring_discount_val', 10, 2)->default(0);
            $table->decimal('manual_adjustment', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);
            $table->enum('status', ['Draft', 'Pending', 'Paid'])->default('Draft');
            $table->boolean('notification_sent')->default(false);
            $table->text('finance_remarks')->nullable();
            $table->date('due_date')->nullable();
            $table->string('month_year')->index(); // e.g., '2025-12' for fast querying
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
