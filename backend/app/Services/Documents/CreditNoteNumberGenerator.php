<?php

namespace App\Services\Documents;

use Illuminate\Support\Facades\DB;

class CreditNoteNumberGenerator
{
    public function generate(): string
    {
        $year = now()->format('Y');

        do {
            $sequenceName = "credit_note_{$year}";
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

            $creditNoteNumber = sprintf('AV-%s-%06d', $year, $number);
        } while (DB::table('orders')->where('credit_note_number', $creditNoteNumber)->exists());

        return $creditNoteNumber;
    }
}
