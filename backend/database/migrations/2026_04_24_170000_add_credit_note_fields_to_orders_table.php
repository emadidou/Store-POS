<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            if (! Schema::hasColumn('orders', 'credit_note_number')) {
                $table->string('credit_note_number', 32)->nullable()->unique()->after('invoice_number');
            }

            if (! Schema::hasColumn('orders', 'original_order_id')) {
                $table->foreignId('original_order_id')->nullable()->after('customer_id')->constrained('orders')->nullOnDelete();
            }

            if (! Schema::hasColumn('orders', 'refunded_at')) {
                $table->timestamp('refunded_at')->nullable()->after('paid_at');
            }

            if (! Schema::hasColumn('orders', 'refund_reason')) {
                $table->text('refund_reason')->nullable()->after('refunded_at');
            }

            if (! Schema::hasColumn('orders', 'refund_amount')) {
                $table->decimal('refund_amount', 10, 2)->nullable()->after('refund_reason');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            if (Schema::hasColumn('orders', 'original_order_id')) {
                $table->dropConstrainedForeignId('original_order_id');
            }

            if (Schema::hasColumn('orders', 'credit_note_number')) {
                $table->dropUnique(['credit_note_number']);
                $table->dropColumn('credit_note_number');
            }

            $columns = array_filter([
                Schema::hasColumn('orders', 'refunded_at') ? 'refunded_at' : null,
                Schema::hasColumn('orders', 'refund_reason') ? 'refund_reason' : null,
                Schema::hasColumn('orders', 'refund_amount') ? 'refund_amount' : null,
            ]);

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
