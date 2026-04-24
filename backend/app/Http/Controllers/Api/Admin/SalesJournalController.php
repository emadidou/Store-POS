<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\Sales\SalesJournalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SalesJournalController extends Controller
{
    public function index(Request $request, SalesJournalService $salesJournalService): JsonResponse
    {
        $filters = $request->only(['date_from', 'date_to', 'source', 'payment_method', 'payment_status', 'document_type']);
        $journal = $salesJournalService->paginated($filters, $request->integer('per_page', 25));

        return response()->json($journal);
    }

    public function export(Request $request, SalesJournalService $salesJournalService): StreamedResponse
    {
        $filters = $request->only(['date_from', 'date_to', 'source', 'payment_method', 'payment_status', 'document_type']);

        return response()->streamDownload(function () use ($filters, $salesJournalService): void {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['date', 'commande', 'document', 'facture', 'avoir', 'facture_origine', 'client', 'ht', 'tva', 'ttc', 'paiement', 'source', 'statut_paiement', 'statut_commande'], ';');

            foreach ($salesJournalService->rows($filters) as $row) {
                fputcsv($handle, [
                    $row['date_document'],
                    $row['order_number'],
                    $row['document_type'],
                    $row['invoice_number'],
                    $row['credit_note_number'],
                    $row['original_invoice_number'],
                    $row['customer_name'],
                    number_format($row['amount_ht'], 2, '.', ''),
                    number_format($row['amount_vat'], 2, '.', ''),
                    number_format($row['amount_ttc'], 2, '.', ''),
                    $row['payment_method'],
                    $row['source'],
                    $row['payment_status'],
                    $row['order_status'],
                ], ';');
            }

            fclose($handle);
        }, 'journal-ventes-'.now()->format('Y-m-d-His').'.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
