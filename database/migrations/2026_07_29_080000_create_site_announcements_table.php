<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->longText('body');
            $table->enum('type', ['info', 'warning', 'success'])->default('info');
            $table->boolean('is_active')->default(true);
            $table->dateTime('published_at')->nullable();
            $table->dateTime('expires_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['is_active', 'published_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_announcements');
    }
};
