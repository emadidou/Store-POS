<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('store_settings', function (Blueprint $table): void {
            $table->string('vat_regime', 32)->default('standard')->after('vat_exempt');
            $table->decimal('default_vat_rate', 5, 2)->default(5.50)->after('vat_regime');
            $table->string('legal_vat_note')->nullable()->after('default_vat_rate');
        });

        Schema::table('orders', function (Blueprint $table): void {
            $table->decimal('subtotal_ht', 10, 2)->default(0)->after('total_amount');
            $table->decimal('total_vat', 10, 2)->default(0)->after('subtotal_ht');
            $table->decimal('total_ttc', 10, 2)->default(0)->after('total_vat');
            $table->decimal('vat_rate', 5, 2)->nullable()->after('total_ttc');
            $table->string('vat_regime', 32)->default('standard')->after('vat_rate');
            $table->string('legal_note')->nullable()->after('vat_regime');
        });

        Schema::table('order_items', function (Blueprint $table): void {
            $table->decimal('unit_price_ht', 10, 2)->default(0)->after('unit_price');
            $table->decimal('unit_price_ttc', 10, 2)->default(0)->after('unit_price_ht');
            $table->decimal('vat_rate', 5, 2)->nullable()->after('unit_price_ttc');
            $table->decimal('vat_amount', 10, 2)->default(0)->after('vat_rate');
            $table->decimal('subtotal_ht', 10, 2)->default(0)->after('vat_amount');
            $table->decimal('subtotal_ttc', 10, 2)->default(0)->after('subtotal_ht');
        });

        DB::table('orders')->orderBy('id')->chunkById(200, function ($orders): void {
            foreach ($orders as $order) {
                DB::table('orders')->where('id', $order->id)->update([
                    'subtotal_ht' => $order->total_amount,
                    'total_vat' => 0,
                    'total_ttc' => $order->total_amount,
                    'vat_rate' => null,
                    'vat_regime' => 'standard',
                ]);
            }
        });

        DB::table('order_items')->orderBy('id')->chunkById(200, function ($items): void {
            foreach ($items as $item) {
                DB::table('order_items')->where('id', $item->id)->update([
                    'unit_price_ht' => $item->unit_price,
                    'unit_price_ttc' => $item->unit_price,
                    'vat_amount' => 0,
                    'subtotal_ht' => $item->subtotal,
                    'subtotal_ttc' => $item->subtotal,
                ]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table): void {
            $table->dropColumn(['unit_price_ht', 'unit_price_ttc', 'vat_rate', 'vat_amount', 'subtotal_ht', 'subtotal_ttc']);
        });

        Schema::table('orders', function (Blueprint $table): void {
            $table->dropColumn(['subtotal_ht', 'total_vat', 'total_ttc', 'vat_rate', 'vat_regime', 'legal_note']);
        });

        Schema::table('store_settings', function (Blueprint $table): void {
            $table->dropColumn(['vat_regime', 'default_vat_rate', 'legal_vat_note']);
        });
    }
};
