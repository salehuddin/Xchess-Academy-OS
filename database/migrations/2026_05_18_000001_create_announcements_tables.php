<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->enum('channel', ['email', 'whatsapp']);
            $table->string('subject')->nullable();
            $table->longText('body');
            $table->enum('audience', ['all_parents', 'class']);
            $table->json('audience_meta')->nullable();
            $table->enum('status', ['Draft', 'Sent'])->default('Draft')->index();
            $table->dateTime('sent_at')->nullable()->index();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('announcement_dispatches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('announcement_id')->constrained('announcements')->cascadeOnDelete();
            $table->enum('channel', ['email', 'whatsapp']);
            $table->string('recipient');
            $table->dateTime('scheduled_for')->index();
            $table->dateTime('sent_at')->nullable()->index();
            $table->enum('status', ['Pending', 'Sent', 'Failed', 'Skipped'])->default('Pending')->index();
            $table->text('error')->nullable();
            $table->json('context')->nullable();
            $table->timestamps();

            $table->unique(['announcement_id', 'channel', 'recipient', 'scheduled_for'], 'announcement_dispatch_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcement_dispatches');
        Schema::dropIfExists('announcements');
    }
};
