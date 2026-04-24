<?php

namespace App\Services\Documents;

use Illuminate\Support\Facades\DB;

class PurchaseNumberGenerator
{
    public function generate(): string
    {
        $year = now()->format('Y');

        do {
            $sequenceName = "purchase_{$year}";
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

            $purchaseNumber = sprintf('ACH-%s-%06d', $year, $number);
        } while (DB::table('purchases')->where('purchase_number', $purchaseNumber)->exists());

        return $purchaseNumber;
    }
}
