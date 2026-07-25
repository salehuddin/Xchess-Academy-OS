<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('channel', ['email', 'whatsapp']);
            $table->enum('trigger', ['invoice_sent', 'invoice_overdue', 'announcement']);
            $table->string('subject')->nullable();
            $table->longText('body');
            $table->boolean('is_active')->default(true);
            $table->json('conditions')->nullable();
            $table->json('schedule')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('notification_dispatches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('notification_id')->constrained('notifications')->cascadeOnDelete();
            $table->enum('channel', ['email', 'whatsapp']);
            $table->string('recipient');
            $table->string('notifiable_type')->nullable();
            $table->unsignedBigInteger('notifiable_id')->nullable();
            $table->dateTime('scheduled_for')->index();
            $table->dateTime('sent_at')->nullable()->index();
            $table->enum('status', ['Pending', 'Sent', 'Failed', 'Skipped'])->default('Pending')->index();
            $table->text('error')->nullable();
            $table->json('context')->nullable();
            $table->timestamps();

            $table->unique(['notification_id', 'channel', 'recipient', 'notifiable_type', 'notifiable_id', 'scheduled_for'], 'notification_dispatch_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_dispatches');
        Schema::dropIfExists('notifications');
    }
};
