<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('orders') || ! Schema::hasTable('document_sequences')) {
            return;
        }

        DB::transaction(function (): void {
            $nextInvoiceNumber = function (string $year): string {
                do {
                    $sequenceName = "invoice_{$year}";
                    $sequence = DB::table('document_sequences')
                        ->where('name', $sequenceName)
                        ->lockForUpdate()
                        ->first();

                    if (! $sequence) {
                        $number = 1;
                        DB::table('document_sequences')->insert([
                            'name' => $sequenceName,
                            'next_number' => 2,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    } else {
                        $number = (int) $sequence->next_number;

                        DB::table('document_sequences')
                            ->where('name', $sequenceName)
                            ->update([
                                'next_number' => $number + 1,
                                'updated_at' => now(),
                            ]);
                    }

                    $invoiceNumber = sprintf('INV-%s-%06d', $year, $number);
                } while (DB::table('orders')->where('invoice_number', $invoiceNumber)->exists());

                return $invoiceNumber;
            };

            $orders = DB::table('orders')
                ->leftJoin('customers', 'customers.id', '=', 'orders.customer_id')
                ->where(function ($query): void {
                    $query
                        ->whereIn('orders.source', ['pos', 'pos-caisse', 'caisse'])
                        ->orWhere('orders.order_type', 'in_store')
                        ->orWhere('customers.phone', 'POS-CAISSE');
                })
                ->orderBy('orders.created_at')
                ->orderBy('orders.id')
                ->get([
                    'orders.id',
                    'orders.created_at',
                    'orders.invoice_number',
                    'orders.paid_at',
                ]);

            foreach ($orders as $order) {
                $year = substr((string) $order->created_at, 0, 4) ?: now()->format('Y');

                DB::table('orders')->where('id', $order->id)->update([
                    'is_paid' => true,
                    'payment_status' => 'paid',
                    'document_type' => 'invoice',
                    'invoice_number' => $order->invoice_number ?: $nextInvoiceNumber($year),
                    'paid_at' => $order->paid_at ?: ($order->created_at ?: now()),
                    'updated_at' => now(),
                ]);
            }
        });
    }

    public function down(): void
    {
        // Intentionally left blank: invoice numbers are accounting identifiers
        // and should not be reverted once generated.
    }
};
