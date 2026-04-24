<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdjustStockRequest;
use App\Http\Requests\UpdateProductStockRequest;
use App\Http\Resources\ProductResource;
use App\Http\Resources\StockMovementResource;
use App\Models\Product;
use App\Models\StockMovement;
use App\Services\StockService;
use App\Services\StockStatsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class StockController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::query()->with('category');

        if ($search = $request->string('search')->trim()->toString()) {
            $query->where(function ($innerQuery) use ($search): void {
                $innerQuery
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($categoryId = $request->integer('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if ($request->filled('availability')) {
            $query->where('is_available', $request->string('availability')->toString() === 'available');
        }

        match ($request->string('status')->toString()) {
            'out_of_stock' => $query->where('stock', '<=', 0),
            'low_stock' => $query->where('stock', '>', 0)->whereColumn('stock', '<=', 'alert_threshold'),
            'in_stock' => $query->whereColumn('stock', '>', 'alert_threshold'),
            default => null,
        };

        return ProductResource::collection(
            $query->orderBy('name')->paginate($request->integer('per_page', 100))
        );
    }

    public function updateProductStock(UpdateProductStockRequest $request, Product $product, StockService $stockService): ProductResource
    {
        $data = $request->validated();

        if (array_key_exists('stock', $data)) {
            $product = $stockService->set(
                $product,
                (float) $data['stock'],
                $data['reason'] ?? 'Correction manuelle',
                'admin',
                $data['note'] ?? null,
            );
        }

        if (array_key_exists('alert_threshold', $data)) {
            $product = $stockService->updateThreshold($product, (float) $data['alert_threshold']);
        }

        if (array_key_exists('is_available', $data)) {
            $product = $stockService->updateAvailability($product, (bool) $data['is_available']);
        }

        return new ProductResource($product->refresh()->load('category'));
    }

    public function adjust(AdjustStockRequest $request, StockService $stockService): ProductResource
    {
        $data = $request->validated();
        $product = Product::query()->findOrFail($data['product_id']);

        $product = match ($data['type']) {
            'in' => $stockService->increase($product, (float) $data['quantity'], $data['reason'] ?? 'Entree stock', $data['source'] ?? 'admin', $data['note'] ?? null),
            'out' => $stockService->decrease($product, (float) $data['quantity'], $data['reason'] ?? 'Sortie stock', $data['source'] ?? 'admin', $data['note'] ?? null),
            default => $stockService->set($product, (float) $data['quantity'], $data['reason'] ?? 'Correction manuelle', $data['source'] ?? 'admin', $data['note'] ?? null),
        };

        return new ProductResource($product);
    }

    public function movements(Request $request): AnonymousResourceCollection
    {
        $query = StockMovement::query()->with('product.category')->latest();

        if ($search = $request->string('search')->trim()->toString()) {
            $query->whereHas('product', function ($productQuery) use ($search): void {
                $productQuery->where('name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->string('type')->toString());
        }

        if ($request->filled('source')) {
            $query->where('source', $request->string('source')->toString());
        }

        return StockMovementResource::collection(
            $query->paginate($request->integer('per_page', 100))
        );
    }

    public function alerts(): JsonResponse
    {
        return response()->json([
            'data' => [
                'out_of_stock' => Product::query()->where('stock', '<=', 0)->count(),
                'low_stock' => Product::query()->where('stock', '>', 0)->whereColumn('stock', '<=', 'alert_threshold')->count(),
            ],
        ]);
    }

    public function stats(StockStatsService $stockStatsService): JsonResponse
    {
        return response()->json([
            'data' => $stockStatsService->summary(),
        ]);
    }

    public function movementsSummary(Request $request, StockStatsService $stockStatsService): JsonResponse
    {
        return response()->json([
            'data' => $stockStatsService->movementSummary($request->integer('days', 7)),
        ]);
    }
}
