<?php

namespace App\Services\Tax;

use App\Enums\VatRegime;
use App\Models\StoreSetting;

class TaxCalculator
{
    public function taxContext(StoreSetting $settings): array
    {
        $regime = $settings->vat_exempt || $settings->vat_regime === VatRegime::FranchiseBase->value
            ? VatRegime::FranchiseBase
            : VatRegime::Standard;

        $rate = $regime === VatRegime::FranchiseBase
            ? 0.0
            : (float) ($settings->default_vat_rate ?? $settings->vat_rate ?? 5.5);

        return [
            'vat_regime' => $regime->value,
            'vat_rate' => $rate,
            'legal_note' => $regime === VatRegime::FranchiseBase
                ? ($settings->legal_vat_note ?: 'TVA non applicable - article 293 B du CGI')
                : $settings->legal_vat_note,
        ];
    }

    public function lineFromTtc(float $unitPriceTtc, float $quantity, float $vatRate): array
    {
        $subtotalTtc = round($unitPriceTtc * $quantity, 2);
        $unitPriceHt = $vatRate > 0 ? round($unitPriceTtc / (1 + $vatRate / 100), 2) : round($unitPriceTtc, 2);
        $subtotalHt = $vatRate > 0 ? round($subtotalTtc / (1 + $vatRate / 100), 2) : $subtotalTtc;
        $vatAmount = round($subtotalTtc - $subtotalHt, 2);

        return [
            'unit_price' => round($unitPriceTtc, 2),
            'unit_price_ht' => $unitPriceHt,
            'unit_price_ttc' => round($unitPriceTtc, 2),
            'vat_rate' => $vatRate,
            'vat_amount' => $vatAmount,
            'subtotal' => $subtotalTtc,
            'subtotal_ht' => $subtotalHt,
            'subtotal_ttc' => $subtotalTtc,
        ];
    }

    public function totals(array $lines): array
    {
        $subtotalHt = round(array_sum(array_column($lines, 'subtotal_ht')), 2);
        $totalVat = round(array_sum(array_column($lines, 'vat_amount')), 2);
        $totalTtc = round(array_sum(array_column($lines, 'subtotal_ttc')), 2);

        return [
            'subtotal_ht' => $subtotalHt,
            'total_vat' => $totalVat,
            'total_ttc' => $totalTtc,
            'total_amount' => $totalTtc,
        ];
    }
}
