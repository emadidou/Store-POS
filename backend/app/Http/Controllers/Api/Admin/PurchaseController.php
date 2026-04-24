<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePurchaseRequest;
use App\Http\Requests\UpdatePurchaseRequest;
use App\Http\Requests\UpdatePurchaseStatusRequest;
use App\Http\Resources\PurchaseResource;
use App\Models\Purchase;
use App\Services\PurchaseJournalService;
use App\Services\PurchaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class PurchaseController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return PurchaseResource::collection(
            Purchase::query()
                ->with(['supplier'])
                ->when($request->string('search')->toString(), function ($query, string $search): void {
                    $query->where(function ($query) use ($search): void {
                        $query
                            ->where('purchase_number', 'like', "%{$search}%")
                            ->orWhere('external_invoice_number', 'like', "%{$search}%")
                            ->orWhereHas('supplier', function ($query) use ($search): void {
                                $query->where('name', 'like', "%{$search}%");
                            });
                    });
                })
                ->when($request->integer('supplier_id'), fn ($query, int $supplierId) => $query->where('supplier_id', $supplierId))
                ->when($request->string('status')->toString(), fn ($query, string $status) => $query->where('status', $status))
                ->when($request->string('payment_status')->toString(), fn ($query, string $status) => $query->where('payment_status', $status))
                ->when($request->string('has_attachment')->toString() !== '', function ($query) use ($request): void {
                    match ($request->string('has_attachment')->toString()) {
                        '1' => $query->whereNotNull('attachment_path'),
                        '0' => $query->whereNull('attachment_path'),
                        default => null,
                    };
                })
                ->when($request->date('date_from'), fn ($query, $date) => $query->whereDate('purchase_date', '>=', $date))
                ->when($request->date('date_to'), fn ($query, $date) => $query->whereDate('purchase_date', '<=', $date))
                ->latest('purchase_date')
                ->paginate($request->integer('per_page', 25))
        );
    }

    public function store(StorePurchaseRequest $request, PurchaseService $purchaseService): JsonResponse
    {
        return (new PurchaseResource(
            $purchaseService->create($request->validated(), $request->file('attachment'))
        ))->response()->setStatusCode(201);
    }

    public function show(Purchase $purchase): PurchaseResource
    {
        return new PurchaseResource($purchase->load(['supplier', 'items.product.category', 'stockMovements.product.category']));
    }

    public function update(UpdatePurchaseRequest $request, Purchase $purchase, PurchaseService $purchaseService): PurchaseResource
    {
        return new PurchaseResource(
            $purchaseService->update($purchase, $request->validated(), $request->file('attachment'))
        );
    }

    public function updateStatus(UpdatePurchaseStatusRequest $request, Purchase $purchase, PurchaseService $purchaseService): PurchaseResource
    {
        $status = $request->validated('status');

        return new PurchaseResource(
            $status === 'confirmed'
                ? $purchaseService->confirm($purchase)
                : $purchaseService->cancel($purchase)
        );
    }

    public function destroy(Purchase $purchase, PurchaseService $purchaseService): Response
    {
        $purchaseService->delete($purchase);

        return response()->noContent();
    }

    public function journal(Request $request, PurchaseJournalService $purchaseJournalService): JsonResponse
    {
        $filters = $request->only(['supplier_id', 'date_from', 'date_to', 'status', 'payment_status', 'has_attachment']);
        return response()->json($purchaseJournalService->paginated($filters, $request->integer('per_page', 25)));
    }

    public function stats(Request $request, PurchaseJournalService $purchaseJournalService): JsonResponse
    {
        return response()->json([
            'data' => $purchaseJournalService->stats($request->only(['supplier_id', 'date_from', 'date_to', 'payment_status', 'has_attachment'])),
        ]);
    }
}
