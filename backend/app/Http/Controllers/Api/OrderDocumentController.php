<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Pdf\DocumentPdfService;
use App\Services\StoreStatusService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

class OrderDocumentController extends Controller
{
    public function show(string $orderNumber, Request $request, DocumentPdfService $pdfService, StoreStatusService $storeStatusService): Response
    {
        $token = (string) $request->query('token', '');
        $order = Order::query()
            ->with(['customer', 'items.product.category'])
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        if (! $order->voucher_token || ! hash_equals($order->voucher_token, $token)) {
            throw new HttpException(403, 'Acces au document non autorise.');
        }

        return $pdfService->stream($order, $storeStatusService->settings());
    }
}
