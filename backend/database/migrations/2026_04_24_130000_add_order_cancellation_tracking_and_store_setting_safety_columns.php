<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            if (! Schema::hasColumn('orders', 'cancelled_at')) {
                $table->timestamp('cancelled_at')->nullable()->after('paid_at');
            }

            if (! Schema::hasColumn('orders', 'stock_restored_at')) {
                $table->timestamp('stock_restored_at')->nullable()->after('cancelled_at');
            }
        });

        Schema::table('store_settings', function (Blueprint $table): void {
            if (! Schema::hasColumn('store_settings', 'vat_regime')) {
                $table->string('vat_regime', 32)->default('standard')->after('vat_exempt');
            }

            if (! Schema::hasColumn('store_settings', 'default_vat_rate')) {
                $table->decimal('default_vat_rate', 5, 2)->default(5.50)->after('vat_regime');
            }

            if (! Schema::hasColumn('store_settings', 'legal_vat_note')) {
                $table->string('legal_vat_note')->nullable()->after('default_vat_rate');
            }

            if (! Schema::hasColumn('store_settings', 'open_message')) {
                $table->string('open_message')->nullable()->after('timezone');
            }

            if (! Schema::hasColumn('store_settings', 'closed_message')) {
                $table->string('closed_message')->nullable()->after('open_message');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $columns = array_filter(
                ['cancelled_at', 'stock_restored_at'],
                fn (string $column): bool => Schema::hasColumn('orders', $column),
            );

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
