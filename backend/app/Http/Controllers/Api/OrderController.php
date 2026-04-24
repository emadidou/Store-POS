<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Http\Resources\StoreSettingResource;
use App\Models\Order;
use App\Services\OrderService;
use App\Services\StoreStatusService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class OrderController extends Controller
{
    public function store(StoreOrderRequest $request, OrderService $orderService): JsonResponse
    {
        $order = $orderService->createPublic($request->validated());

        return (new OrderResource($order))->response()->setStatusCode(201);
    }

    public function voucher(string $orderNumber, Request $request, StoreStatusService $storeStatusService): JsonResponse
    {
        $token = (string) $request->query('token', '');
        $order = Order::query()
            ->with(['customer', 'items.product.category'])
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        if (! $order->voucher_token || ! hash_equals($order->voucher_token, $token)) {
            throw new HttpException(403, 'Acces au bon de commande non autorise.');
        }

        if (($order->document_type?->value ?? $order->document_type) !== 'order_voucher') {
            throw new HttpException(403, 'Le bon de commande est disponible uniquement pour le paiement a la reception.');
        }

        return response()->json([
            'data' => [
                'order' => new OrderResource($order),
                'store' => new StoreSettingResource($storeStatusService->settings()),
            ],
        ]);
    }
}
