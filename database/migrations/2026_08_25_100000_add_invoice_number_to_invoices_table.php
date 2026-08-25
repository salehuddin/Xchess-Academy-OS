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
        Schema::table('invoices', function (Blueprint $table) {
            $table->string('invoice_number', 30)->nullable()->after('id');
            $table->unique('invoice_number');
        });

        // Backfill existing invoices with structured numbers:
        // INV-YYYYMM-##### sequenced per billing month in id order.
        $months = DB::table('invoices')
            ->whereNull('invoice_number')
            ->distinct()
            ->orderBy('month_year')
            ->pluck('month_year');

        foreach ($months as $monthYear) {
            $stamp = str_replace('-', '', (string) $monthYear);

            $ids = DB::table('invoices')
                ->where('month_year', $monthYear)
                ->whereNull('invoice_number')
                ->orderBy('id')
                ->pluck('id');

            foreach ($ids as $sequence => $id) {
                DB::table('invoices')
                    ->where('id', $id)
                    ->update(['invoice_number' => sprintf('INV-%s-%05d', $stamp, $sequence + 1)]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropUnique(['invoice_number']);
            $table->dropColumn('invoice_number');
        });
    }
};
