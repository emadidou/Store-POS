<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_movements', function (Blueprint $table): void {
            if (! Schema::hasColumn('stock_movements', 'purchase_id')) {
                $table->foreignId('purchase_id')->nullable()->after('product_id')->constrained()->nullOnDelete();
            }

            if (! Schema::hasColumn('stock_movements', 'reference')) {
                $table->string('reference', 64)->nullable()->after('source')->index();
            }
        });

        Schema::table('products', function (Blueprint $table): void {
            if (! Schema::hasColumn('products', 'average_purchase_cost_ht')) {
                $table->decimal('average_purchase_cost_ht', 10, 2)->nullable()->after('price');
            }

            if (! Schema::hasColumn('products', 'last_purchase_cost_ht')) {
                $table->decimal('last_purchase_cost_ht', 10, 2)->nullable()->after('average_purchase_cost_ht');
            }

            if (! Schema::hasColumn('products', 'last_purchased_at')) {
                $table->timestamp('last_purchased_at')->nullable()->after('last_purchase_cost_ht');
            }
        });
    }

    public function down(): void
    {
        Schema::table('stock_movements', function (Blueprint $table): void {
            if (Schema::hasColumn('stock_movements', 'purchase_id')) {
                $table->dropConstrainedForeignId('purchase_id');
            }

            if (Schema::hasColumn('stock_movements', 'reference')) {
                $table->dropColumn('reference');
            }
        });

        Schema::table('products', function (Blueprint $table): void {
            $columns = array_filter([
                Schema::hasColumn('products', 'average_purchase_cost_ht') ? 'average_purchase_cost_ht' : null,
                Schema::hasColumn('products', 'last_purchase_cost_ht') ? 'last_purchase_cost_ht' : null,
                Schema::hasColumn('products', 'last_purchased_at') ? 'last_purchased_at' : null,
            ]);

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
