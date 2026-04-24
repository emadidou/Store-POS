<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockService
{
    public function increase(Product $product, float $quantity, string $reason = 'stock_in', ?string $source = 'admin', ?string $note = null, ?string $reference = null, ?int $purchaseId = null): Product
    {
        return $this->move($product, 'in', $quantity, $reason, $source, $note, $reference, $purchaseId);
    }

    public function decrease(Product $product, float $quantity, string $reason = 'stock_out', ?string $source = 'admin', ?string $note = null, ?string $reference = null, ?int $purchaseId = null): Product
    {
        return $this->move($product, 'out', $quantity, $reason, $source, $note, $reference, $purchaseId);
    }

    public function set(Product $product, float $stock, string $reason = 'manual_adjustment', ?string $source = 'admin', ?string $note = null, ?string $reference = null, ?int $purchaseId = null): Product
    {
        if ($stock < 0) {
            throw ValidationException::withMessages([
                'stock' => ['Le stock ne peut pas etre negatif.'],
            ]);
        }

        return DB::transaction(function () use ($product, $stock, $reason, $source, $note, $reference, $purchaseId): Product {
            $lockedProduct = Product::query()->lockForUpdate()->findOrFail($product->id);
            $previousStock = (float) $lockedProduct->stock;

            $lockedProduct->update([
                'stock' => $stock,
                'is_available' => $stock <= 0 ? false : $lockedProduct->is_available,
                'last_stock_update_at' => now(),
            ]);

            $this->recordMovement($lockedProduct, 'adjustment', abs($stock - $previousStock), $previousStock, $stock, $reason, $source, $note, $reference, $purchaseId);

            return $lockedProduct->refresh()->load('category');
        });
    }

    public function updateThreshold(Product $product, float $threshold): Product
    {
        $product->update(['alert_threshold' => $threshold]);

        return $product->refresh()->load('category');
    }

    public function updateAvailability(Product $product, bool $isAvailable): Product
    {
        $product->update(['is_available' => $isAvailable]);

        return $product->refresh()->load('category');
    }

    private function move(Product $product, string $type, float $quantity, string $reason, ?string $source, ?string $note, ?string $reference, ?int $purchaseId): Product
    {
        if ($quantity <= 0) {
            throw ValidationException::withMessages([
                'quantity' => ['La quantite doit etre superieure a 0.'],
            ]);
        }

        return DB::transaction(function () use ($product, $type, $quantity, $reason, $source, $note, $reference, $purchaseId): Product {
            $lockedProduct = Product::query()->lockForUpdate()->findOrFail($product->id);
            $previousStock = (float) $lockedProduct->stock;
            $newStock = $type === 'out' ? $previousStock - $quantity : $previousStock + $quantity;

            if ($newStock < 0) {
                throw ValidationException::withMessages([
                    'quantity' => ["Stock insuffisant pour {$lockedProduct->name}."],
                ]);
            }

            $lockedProduct->update([
                'stock' => $newStock,
                'is_available' => $newStock <= 0 ? false : $lockedProduct->is_available,
                'last_stock_update_at' => now(),
            ]);

            $this->recordMovement($lockedProduct, $type, $quantity, $previousStock, $newStock, $reason, $source, $note, $reference, $purchaseId);

            return $lockedProduct->refresh()->load('category');
        });
    }

    private function recordMovement(Product $product, string $type, float $quantity, float $previousStock, float $newStock, string $reason, ?string $source, ?string $note, ?string $reference, ?int $purchaseId): void
    {
        StockMovement::query()->create([
            'product_id' => $product->id,
            'purchase_id' => $purchaseId,
            'type' => $type,
            'quantity' => $quantity,
            'previous_stock' => $previousStock,
            'new_stock' => $newStock,
            'reason' => $reason,
            'source' => $source,
            'reference' => $reference,
            'note' => $note,
            'created_by' => auth()->user()?->email,
        ]);
    }
}
