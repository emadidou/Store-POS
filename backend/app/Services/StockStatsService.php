<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockMovement;

class StockStatsService
{
    public function summary(int $criticalLimit = 5): array
    {
        $products = Product::query()->with('category:id,name')->get();

        $totalProducts = $products->count();
        $inStockProducts = $products->filter(fn (Product $product) => $this->statusKey($product) === 'in_stock')->count();
        $lowStockProducts = $products->filter(fn (Product $product) => $this->statusKey($product) === 'low_stock')->count();
        $outOfStockProducts = $products->filter(fn (Product $product) => $this->statusKey($product) === 'out_of_stock')->count();
        $availableProducts = $products->where('is_available', true)->count();
        $unavailableProducts = $products->where('is_available', false)->count();
        $stockUnitsTotal = (float) $products->sum(fn (Product $product) => (float) $product->stock);
        $stockValueTotal = (float) $products->sum(fn (Product $product) => (float) $product->stock * (float) $product->price);

        return [
            'totals' => [
                'total_products' => $totalProducts,
                'in_stock_products' => $inStockProducts,
                'low_stock_products' => $lowStockProducts,
                'out_of_stock_products' => $outOfStockProducts,
                'available_products' => $availableProducts,
                'unavailable_products' => $unavailableProducts,
                'stock_units_total' => round($stockUnitsTotal, 3),
                'stock_value_total' => round($stockValueTotal, 2),
            ],
            'status_distribution' => [
                ['key' => 'in_stock', 'label' => 'En stock', 'value' => $inStockProducts],
                ['key' => 'low_stock', 'label' => 'Stock faible', 'value' => $lowStockProducts],
                ['key' => 'out_of_stock', 'label' => 'Rupture', 'value' => $outOfStockProducts],
            ],
            'availability_distribution' => [
                ['key' => 'available', 'label' => 'Disponibles', 'value' => $availableProducts],
                ['key' => 'unavailable', 'label' => 'Indisponibles', 'value' => $unavailableProducts],
            ],
            'critical_products' => $products
                ->filter(fn (Product $product) => $this->statusKey($product) !== 'in_stock')
                ->sortBy([
                    fn (Product $product) => $this->statusWeight($product),
                    fn (Product $product) => (float) $product->stock,
                ])
                ->take($criticalLimit)
                ->values()
                ->map(fn (Product $product) => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'category' => $product->category?->name ?? 'Sans categorie',
                    'stock' => (float) $product->stock,
                    'alert_threshold' => (float) ($product->alert_threshold ?? 0),
                    'status' => $this->statusKey($product),
                ])
                ->all(),
            'category_stock' => $products
                ->groupBy(fn (Product $product) => $product->category?->name ?? 'Sans categorie')
                ->map(function ($group, string $category): array {
                    $productsCollection = collect($group);

                    return [
                        'category' => $category,
                        'stock_units' => round((float) $productsCollection->sum(fn (Product $product) => (float) $product->stock), 3),
                        'stock_value' => round((float) $productsCollection->sum(fn (Product $product) => (float) $product->stock * (float) $product->price), 2),
                        'products_count' => $productsCollection->count(),
                    ];
                })
                ->sortByDesc('stock_units')
                ->values()
                ->all(),
            'recent_movements' => $this->movementSummary(),
        ];
    }

    public function movementSummary(int $days = 7): array
    {
        $days = max(1, min($days, 30));
        $startDate = now()->startOfDay()->subDays($days - 1);

        $movements = StockMovement::query()
            ->where('created_at', '>=', $startDate)
            ->get(['type', 'quantity', 'created_at']);

        return collect(range(0, $days - 1))
            ->map(function (int $offset) use ($movements, $startDate): array {
                $date = $startDate->copy()->addDays($offset);
                $daily = $movements->filter(fn (StockMovement $movement) => $movement->created_at?->isSameDay($date));

                return [
                    'date' => $date->toDateString(),
                    'label' => $date->locale('fr')->translatedFormat('d M'),
                    'in' => round((float) $daily->where('type', 'in')->sum('quantity'), 3),
                    'out' => round((float) $daily->where('type', 'out')->sum('quantity'), 3),
                    'adjustment' => round((float) $daily->where('type', 'adjustment')->sum('quantity'), 3),
                ];
            })
            ->all();
    }

    private function statusKey(Product $product): string
    {
        $stock = (float) $product->stock;
        $threshold = (float) ($product->alert_threshold ?? 0);

        if ($stock <= 0) {
            return 'out_of_stock';
        }

        if ($stock <= $threshold) {
            return 'low_stock';
        }

        return 'in_stock';
    }

    private function statusWeight(Product $product): int
    {
        return match ($this->statusKey($product)) {
            'out_of_stock' => 0,
            'low_stock' => 1,
            default => 2,
        };
    }
}
