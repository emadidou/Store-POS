<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\DocumentType;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Pdf\DocumentPdfService;
use App\Services\StoreStatusService;
use Illuminate\Http\Response;

class OrderDocumentController extends Controller
{
    public function invoice(Order $order, DocumentPdfService $pdfService, StoreStatusService $storeStatusService): Response
    {
        return $pdfService->stream($order, $storeStatusService->settings(), DocumentType::Invoice->value);
    }

    public function voucher(Order $order, DocumentPdfService $pdfService, StoreStatusService $storeStatusService): Response
    {
        return $pdfService->stream($order, $storeStatusService->settings(), DocumentType::OrderVoucher->value);
    }
}
