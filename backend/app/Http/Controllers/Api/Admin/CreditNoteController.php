<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\DocumentType;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCreditNoteRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\CreditNoteService;
use App\Services\Pdf\DocumentPdfService;
use App\Services\StoreStatusService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CreditNoteController extends Controller
{
    public function store(StoreCreditNoteRequest $request, Order $order, CreditNoteService $creditNoteService): OrderResource
    {
        return new OrderResource($creditNoteService->create($order, $request->validated()));
    }

    public function forOrder(Order $order, CreditNoteService $creditNoteService): AnonymousResourceCollection
    {
        return OrderResource::collection($creditNoteService->forInvoice($order));
    }

    public function index(Request $request, CreditNoteService $creditNoteService): AnonymousResourceCollection
    {
        $creditNotes = $creditNoteService
            ->list($request->only(['search']))
            ->paginate($request->integer('per_page', 25));

        return OrderResource::collection($creditNotes);
    }

    public function pdf(Order $order, DocumentPdfService $pdfService, StoreStatusService $storeStatusService): Response
    {
        $documentType = $order->document_type?->value ?? $order->document_type;

        if ($documentType !== DocumentType::CreditNote->value) {
            throw new HttpException(404);
        }

        return $pdfService->stream($order, $storeStatusService->settings(), DocumentType::CreditNote->value);
    }
}
