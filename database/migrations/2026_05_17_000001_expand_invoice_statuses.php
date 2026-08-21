<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE `invoices` MODIFY `status` ENUM('Draft','Pending','Paid','Overdue','Partial') NOT NULL DEFAULT 'Draft'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE `invoices` MODIFY `status` ENUM('Draft','Pending','Paid') NOT NULL DEFAULT 'Draft'");
        }
    }
};
