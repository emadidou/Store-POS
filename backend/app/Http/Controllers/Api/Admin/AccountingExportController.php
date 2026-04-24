<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\Accounting\AccountingExportService;
use App\Services\Accounting\PurchaseAccountingExportService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AccountingExportController extends Controller
{
    public function index(Request $request, AccountingExportService $accountingExportService): StreamedResponse
    {
        $filters = $request->only(['type', 'date', 'month', 'year', 'source', 'payment_method', 'payment_status', 'document_type', 'type_document']);

        return $accountingExportService->generateCsv($filters);
    }

    public function csv(Request $request, AccountingExportService $accountingExportService): StreamedResponse
    {
        $filters = $request->only(['type', 'date', 'month', 'year', 'date_from', 'date_to', 'source', 'payment_method', 'payment_status', 'document_type', 'type_document']);

        return $accountingExportService->csv($filters);
    }

    public function xlsx(Request $request, AccountingExportService $accountingExportService): BinaryFileResponse
    {
        $filters = $request->only(['type', 'date', 'month', 'year', 'date_from', 'date_to', 'source', 'payment_method', 'payment_status', 'document_type', 'type_document']);

        return $accountingExportService->generateXlsx($filters);
    }

    public function purchases(Request $request, PurchaseAccountingExportService $purchaseAccountingExportService): StreamedResponse
    {
        $filters = $request->only(['type', 'date', 'month', 'year', 'supplier_id', 'status', 'payment_status', 'has_attachment']);

        return $purchaseAccountingExportService->generateCsv($filters);
    }
}
