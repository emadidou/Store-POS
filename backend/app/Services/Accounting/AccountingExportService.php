<?php

namespace App\Services\Accounting;

use App\Exports\AccountingExport;
use App\Services\Sales\SalesJournalService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AccountingExportService
{
    public function __construct(private readonly SalesJournalService $salesJournalService)
    {
    }

    public function csv(array $filters): StreamedResponse
    {
        return $this->generateCsv($filters);
    }

    public function generateCsv(array $filters): StreamedResponse
    {
        $period = $this->filterByPeriod($filters);
        $filename = $period['filename'];
        $queryFilters = [
            ...$period['filters'],
            ...array_filter([
                'source' => $filters['source'] ?? null,
                'payment_method' => $filters['payment_method'] ?? null,
                'payment_status' => $filters['payment_status'] ?? null,
                'document_type' => in_array(($filters['document_type'] ?? ''), ['invoice', 'credit_note'], true) ? $filters['document_type'] : null,
            ], fn ($value) => $value !== null && $value !== ''),
            'document_types' => ['invoice', 'credit_note'],
        ];

        $columns = [
            'Date',
            'Facture',
            'Avoir',
            'Facture origine',
            'Type',
            'Commande',
            'Client',
            'Sens',
            'Paiement',
            'HT',
            'TVA',
            'TTC',
            'Statut',
            'Source',
        ];

        return response()->streamDownload(function () use ($columns, $queryFilters): void {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, $columns, ';');

            $this->salesJournalService->query($queryFilters)
                ->orderBy('created_at')
                ->with('customer')
                ->chunk(500, function ($orders) use ($handle): void {
                    foreach ($orders as $order) {
                        $row = $this->salesJournalService->row($order);

                        fputcsv($handle, [
                            $row['date_document'],
                            $row['invoice_number'],
                            $row['credit_note_number'],
                            $row['original_invoice_number'],
                            $row['document_type'],
                            $row['order_number'],
                            $row['customer_name'],
                            $row['document_type'] === 'credit_note' ? 'credit' : 'debit',
                            $row['payment_method'],
                            number_format($row['amount_ht'], 2, '.', ''),
                            number_format($row['amount_vat'], 2, '.', ''),
                            number_format($row['amount_ttc'], 2, '.', ''),
                            $row['payment_status'],
                            $row['source'],
                        ], ';');
                    }
                });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function generateXlsx(array $filters): BinaryFileResponse
    {
        $period = $this->filterByPeriod($filters);
        $filename = str_replace('.csv', '.xlsx', $period['filename']);
        $queryFilters = [
            ...$period['filters'],
            ...array_filter([
                'source' => $filters['source'] ?? null,
                'payment_method' => $filters['payment_method'] ?? null,
                'payment_status' => $filters['payment_status'] ?? null,
                'document_type' => in_array(($filters['document_type'] ?? ''), ['invoice', 'credit_note'], true) ? $filters['document_type'] : null,
            ], fn ($value) => $value !== null && $value !== ''),
            'document_types' => ['invoice', 'credit_note'],
        ];

        return Excel::download(new AccountingExport($this->salesJournalService, $queryFilters), $filename);
    }

    public function filterByPeriod(array $filters): array
    {
        $type = $filters['type'] ?? 'all';
        $validator = Validator::make($filters, [
            'type' => ['nullable', 'in:day,month,year,all'],
            'date' => ['required_if:type,day', 'nullable', 'date_format:Y-m-d'],
            'month' => ['required_if:type,month', 'nullable', 'date_format:Y-m'],
            'year' => ['required_if:type,year', 'nullable', 'date_format:Y'],
            'source' => ['nullable', 'string', 'max:80'],
            'payment_method' => ['nullable', 'string', 'max:80'],
            'payment_status' => ['nullable', 'in:pending,paid,failed'],
            'document_type' => ['nullable', 'in:invoice,credit_note'],
            'type_document' => ['nullable', 'in:invoice,credit_note'],
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return match ($type) {
            'day' => [
                'filename' => "export-{$filters['date']}.csv",
                'filters' => ['period_type' => 'day', 'date' => $filters['date']],
            ],
            'month' => [
                'filename' => "export-{$filters['month']}.csv",
                'filters' => ['period_type' => 'month', 'month' => $filters['month']],
            ],
            'year' => [
                'filename' => "export-{$filters['year']}.csv",
                'filters' => ['period_type' => 'year', 'year' => $filters['year']],
            ],
            default => [
                'filename' => 'export-all.csv',
                'filters' => ['period_type' => 'all'],
            ],
        };
    }
}
