<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            if (! Schema::hasColumn('products', 'alert_threshold')) {
                $table->decimal('alert_threshold', 10, 3)->default(5)->after('stock');
            }

            if (! Schema::hasColumn('products', 'last_stock_update_at')) {
                $table->timestamp('last_stock_update_at')->nullable()->after('alert_threshold');
            }
        });

        DB::table('products')
            ->whereNull('last_stock_update_at')
            ->update(['last_stock_update_at' => DB::raw('updated_at')]);
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            if (Schema::hasColumn('products', 'last_stock_update_at')) {
                $table->dropColumn('last_stock_update_at');
            }

            if (Schema::hasColumn('products', 'alert_threshold')) {
                $table->dropColumn('alert_threshold');
            }
        });
    }
};
