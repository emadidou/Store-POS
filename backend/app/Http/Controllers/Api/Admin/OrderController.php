<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdminOrderRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Enums\DocumentType;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class OrderController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $orders = Order::query()
            ->with('customer')
            ->where('document_type', '!=', DocumentType::CreditNote->value)
            ->when($request->string('search')->toString(), function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('order_number', 'like', "%{$search}%")
                        ->orWhere('invoice_number', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($query) use ($search): void {
                            $query
                                ->where('full_name', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->string('status')->toString(), fn ($query, string $status) => $query->where('status', $status))
            ->when($request->string('payment_status')->toString(), fn ($query, string $status) => $query->where('payment_status', $status))
            ->when($request->string('payment_method')->toString(), fn ($query, string $method) => $query->where('payment_method', $method))
            ->when($request->string('source')->toString(), fn ($query, string $source) => $query->where('source', $source))
            ->when($request->string('order_type')->toString(), fn ($query, string $type) => $query->where('order_type', $type))
            ->when($request->string('document_type')->toString(), fn ($query, string $type) => $query->where('document_type', $type))
            ->when($request->date('date_from'), fn ($query, $date) => $query->whereDate('created_at', '>=', $date))
            ->when($request->date('date_to'), fn ($query, $date) => $query->whereDate('created_at', '<=', $date))
            ->when($request->date('pickup_date'), fn ($query, $date) => $query->whereDate('pickup_date', $date))
            ->when($request->string('sort')->toString(), function ($query, string $sort): void {
                match ($sort) {
                    'oldest' => $query->oldest(),
                    'pickup_asc' => $query->orderBy('pickup_date')->orderBy('pickup_time'),
                    'pickup_desc' => $query->orderByDesc('pickup_date')->orderByDesc('pickup_time'),
                    'total_asc' => $query->orderBy('total_amount'),
                    'total_desc' => $query->orderByDesc('total_amount'),
                    default => $query->latest(),
                };
            }, fn ($query) => $query->latest())
            ->paginate($request->integer('per_page', 25));

        return OrderResource::collection($orders);
    }

    public function store(StoreAdminOrderRequest $request, OrderService $orderService): OrderResource
    {
        return new OrderResource($orderService->createAdmin($request->validated()));
    }

    public function show(Order $order): OrderResource
    {
        return new OrderResource($order->load(['customer', 'items.product.category']));
    }

    public function update(UpdateOrderRequest $request, Order $order, OrderService $orderService): OrderResource
    {
        return new OrderResource($orderService->updateAdmin($order, $request->validated()));
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order, OrderService $orderService): OrderResource
    {
        return new OrderResource(
            $orderService->updateStatus(
                $order,
                $request->validated('status'),
            )
        );
    }

    public function destroy(Order $order, OrderService $orderService): Response
    {
        $orderService->delete($order);

        return response()->noContent();
    }
}
