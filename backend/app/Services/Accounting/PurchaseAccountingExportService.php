<?php

namespace App\Services\Accounting;

use App\Services\PurchaseJournalService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PurchaseAccountingExportService
{
    public function __construct(
        private readonly PurchaseJournalService $purchaseJournalService,
    ) {
    }

    public function generateCsv(array $filters): StreamedResponse
    {
        $period = $this->filterByPeriod($filters);
        $queryFilters = [
            ...$period['filters'],
            ...array_filter([
                'supplier_id' => $filters['supplier_id'] ?? null,
                'status' => $filters['status'] ?? null,
                'payment_status' => $filters['payment_status'] ?? null,
                'has_attachment' => $filters['has_attachment'] ?? null,
            ], fn ($value) => $value !== null && $value !== ''),
        ];

        return response()->streamDownload(function () use ($queryFilters): void {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, [
                'date_achat',
                'fournisseur',
                'numero_facture_fournisseur',
                'numero_achat_interne',
                'montant_ht',
                'montant_tva',
                'montant_ttc',
                'statut_paiement',
                'methode_paiement',
                'fichier_facture',
                'notes',
            ], ';');

            foreach ($this->purchaseJournalService->rows($queryFilters) as $row) {
                fputcsv($handle, [
                    $row['date_purchase'],
                    $row['supplier_name'],
                    $row['external_invoice_number'],
                    $row['purchase_number'],
                    number_format((float) $row['amount_ht'], 2, '.', ''),
                    number_format((float) $row['amount_vat'], 2, '.', ''),
                    number_format((float) $row['amount_ttc'], 2, '.', ''),
                    $row['payment_status'],
                    $row['payment_method'],
                    $row['has_attachment'] ? 'oui' : 'non',
                    $row['notes'],
                ], ';');
            }

            fclose($handle);
        }, $period['filename'], [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function filterByPeriod(array $filters): array
    {
        $type = $filters['type'] ?? 'all';
        $validator = Validator::make($filters, [
            'type' => ['nullable', 'in:day,month,year,all'],
            'date' => ['required_if:type,day', 'nullable', 'date_format:Y-m-d'],
            'month' => ['required_if:type,month', 'nullable', 'date_format:Y-m'],
            'year' => ['required_if:type,year', 'nullable', 'date_format:Y'],
            'supplier_id' => ['nullable', 'integer'],
            'status' => ['nullable', 'in:confirmed'],
            'payment_status' => ['nullable', 'in:unpaid,paid,partial'],
            'has_attachment' => ['nullable', 'in:0,1'],
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return match ($type) {
            'day' => [
                'filename' => "export-achats-{$filters['date']}.csv",
                'filters' => ['date_from' => $filters['date'], 'date_to' => $filters['date']],
            ],
            'month' => [
                'filename' => "export-achats-{$filters['month']}.csv",
                'filters' => ['date_from' => "{$filters['month']}-01", 'date_to' => CarbonImmutable::createFromFormat('Y-m', $filters['month'])->endOfMonth()->toDateString()],
            ],
            'year' => [
                'filename' => "export-achats-{$filters['year']}.csv",
                'filters' => ['date_from' => "{$filters['year']}-01-01", 'date_to' => "{$filters['year']}-12-31"],
            ],
            default => [
                'filename' => 'export-achats-all.csv',
                'filters' => [],
            ],
        };
    }
}
