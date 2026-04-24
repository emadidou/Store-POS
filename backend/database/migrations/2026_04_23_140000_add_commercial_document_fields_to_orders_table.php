<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_sequences', function (Blueprint $table): void {
            $table->string('name')->primary();
            $table->unsignedInteger('next_number')->default(1);
            $table->timestamps();
        });

        Schema::table('orders', function (Blueprint $table): void {
            $table->string('payment_status', 24)->default('pending')->after('is_paid');
            $table->string('document_type', 32)->default('order_voucher')->after('payment_status');
            $table->string('invoice_number', 32)->nullable()->unique()->after('document_type');
            $table->timestamp('paid_at')->nullable()->after('invoice_number');
        });

        $paidOrders = DB::table('orders')
            ->where('is_paid', true)
            ->orderBy('id')
            ->get(['id', 'created_at']);

        $sequenceByYear = [];

        foreach ($paidOrders as $order) {
            $year = substr((string) $order->created_at, 0, 4) ?: now()->format('Y');
            $sequenceByYear[$year] = ($sequenceByYear[$year] ?? 0) + 1;

            DB::table('orders')->where('id', $order->id)->update([
                'payment_status' => 'paid',
                'document_type' => 'invoice',
                'invoice_number' => sprintf('INV-%s-%06d', $year, $sequenceByYear[$year]),
                'paid_at' => $order->created_at ?? now(),
            ]);
        }

        foreach ($sequenceByYear as $year => $lastNumber) {
            DB::table('document_sequences')->updateOrInsert(
                ['name' => "invoice_{$year}"],
                ['next_number' => $lastNumber + 1, 'created_at' => now(), 'updated_at' => now()],
            );
        }
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropUnique(['invoice_number']);
            $table->dropColumn(['payment_status', 'document_type', 'invoice_number', 'paid_at']);
        });

        Schema::dropIfExists('document_sequences');
    }
};
