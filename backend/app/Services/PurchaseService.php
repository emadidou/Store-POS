<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Purchase;
use App\Services\Documents\PurchaseNumberGenerator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class PurchaseService
{
    public function __construct(
        private readonly PurchaseNumberGenerator $purchaseNumberGenerator,
        private readonly StockService $stockService,
    ) {
    }

    public function create(array $data, ?UploadedFile $attachment = null): Purchase
    {
        return DB::transaction(function () use ($data, $attachment): Purchase {
            $preparedItems = $this->prepareItems($data['items'] ?? []);
            $totals = $this->totals($preparedItems);

            $purchase = Purchase::query()->create([
                'supplier_id' => $data['supplier_id'] ?? null,
                'purchase_number' => $this->purchaseNumberGenerator->generate(),
                'external_invoice_number' => $data['external_invoice_number'] ?? null,
                'external_invoice_date' => $data['external_invoice_date'] ?? null,
                'purchase_date' => $data['purchase_date'],
                'status' => 'draft',
                'subtotal_ht' => $totals['subtotal_ht'],
                'total_vat' => $totals['total_vat'],
                'total_ttc' => $totals['total_ttc'],
                'payment_status' => $data['payment_status'] ?? 'unpaid',
                'payment_method' => $data['payment_method'] ?? null,
                'paid_at' => $data['paid_at'] ?? null,
                'notes' => $data['notes'] ?? null,
                'attachment_path' => $attachment ? $this->storeAttachment($attachment, null) : null,
            ]);

            if ($purchase->attachment_path) {
                $purchase->update([
                    'attachment_path' => $this->moveAttachmentToPurchaseDirectory($purchase->attachment_path, $purchase->purchase_number),
                ]);
            }

            if ($preparedItems !== []) {
                $purchase->items()->createMany($preparedItems);
            }

            if (($data['status'] ?? 'draft') === 'confirmed') {
                return $this->confirm($purchase);
            }

            if (($data['status'] ?? 'draft') === 'cancelled') {
                return $this->cancel($purchase);
            }

            return $purchase->refresh()->load(['supplier', 'items.product', 'stockMovements.product']);
        });
    }

    public function update(Purchase $purchase, array $data, ?UploadedFile $attachment = null): Purchase
    {
        if ($purchase->status !== 'draft') {
            throw ValidationException::withMessages([
                'purchase' => ['Seul un achat en brouillon peut etre modifie.'],
            ]);
        }

        return DB::transaction(function () use ($purchase, $data, $attachment): Purchase {
            $preparedItems = $this->prepareItems($data['items'] ?? []);
            $totals = $this->totals($preparedItems);
            $updates = [
                'supplier_id' => $data['supplier_id'] ?? null,
                'external_invoice_number' => $data['external_invoice_number'] ?? null,
                'external_invoice_date' => $data['external_invoice_date'] ?? null,
                'purchase_date' => $data['purchase_date'],
                'payment_status' => $data['payment_status'] ?? 'unpaid',
                'payment_method' => $data['payment_method'] ?? null,
                'paid_at' => $data['paid_at'] ?? null,
                'notes' => $data['notes'] ?? null,
                ...$totals,
            ];

            if ((bool) ($data['remove_attachment'] ?? false)) {
                $this->deleteAttachment($purchase->attachment_path);
                $updates['attachment_path'] = null;
            }

            if ($attachment) {
                $this->deleteAttachment($purchase->attachment_path);
                $updates['attachment_path'] = $this->storeAttachment($attachment, $purchase->purchase_number);
            }

            $purchase->update($updates);
            $purchase->items()->delete();

            if ($preparedItems !== []) {
                $purchase->items()->createMany($preparedItems);
            }

            if (($data['status'] ?? 'draft') === 'confirmed') {
                return $this->confirm($purchase->refresh());
            }

            return $purchase->refresh()->load(['supplier', 'items.product', 'stockMovements.product']);
        });
    }

    public function confirm(Purchase $purchase): Purchase
    {
        return DB::transaction(function () use ($purchase): Purchase {
            $purchase = Purchase::query()
                ->with(['items.product', 'supplier', 'stockMovements.product'])
                ->lockForUpdate()
                ->findOrFail($purchase->id);

            if ($purchase->status === 'confirmed' || $purchase->stock_applied_at) {
                throw ValidationException::withMessages([
                    'status' => ['Cet achat a deja ete confirme.'],
                ]);
            }

            if ($purchase->status === 'cancelled') {
                throw ValidationException::withMessages([
                    'status' => ['Un achat annule ne peut pas etre confirme.'],
                ]);
            }

            if ($purchase->items->isEmpty()) {
                throw ValidationException::withMessages([
                    'items' => ['Un achat confirme doit contenir au moins une ligne produit.'],
                ]);
            }

            foreach ($purchase->items as $item) {
                $this->stockService->increase(
                    $item->product,
                    (float) $item->quantity,
                    'Achat fournisseur',
                    'purchase',
                    $purchase->external_invoice_number,
                    $purchase->purchase_number,
                    $purchase->id,
                );
            }

            $purchase->update([
                'status' => 'confirmed',
                'confirmed_at' => now(),
                'cancelled_at' => null,
                'stock_applied_at' => now(),
            ]);

            $this->refreshProductPurchaseStats($purchase->items->pluck('product_id')->all());

            return $purchase->refresh()->load(['supplier', 'items.product', 'stockMovements.product']);
        });
    }

    public function cancel(Purchase $purchase): Purchase
    {
        return DB::transaction(function () use ($purchase): Purchase {
            $purchase = Purchase::query()
                ->with(['items.product', 'supplier', 'stockMovements.product'])
                ->lockForUpdate()
                ->findOrFail($purchase->id);

            if ($purchase->status === 'cancelled') {
                return $purchase->refresh()->load(['supplier', 'items.product', 'stockMovements.product']);
            }

            if ($purchase->status === 'confirmed' && $purchase->stock_applied_at) {
                foreach ($purchase->items as $item) {
                    if ((float) $item->product->stock < (float) $item->quantity) {
                        throw ValidationException::withMessages([
                            'status' => ["Impossible d'annuler {$purchase->purchase_number}: le stock actuel de {$item->product->name} est insuffisant pour annuler l'entree."],
                        ]);
                    }
                }

                foreach ($purchase->items as $item) {
                    $this->stockService->decrease(
                        $item->product,
                        (float) $item->quantity,
                        'Annulation achat fournisseur',
                        'purchase',
                        $purchase->external_invoice_number,
                        $purchase->purchase_number,
                        $purchase->id,
                    );
                }
            }

            $purchase->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
            ]);

            $this->refreshProductPurchaseStats($purchase->items->pluck('product_id')->all());

            return $purchase->refresh()->load(['supplier', 'items.product', 'stockMovements.product']);
        });
    }

    public function delete(Purchase $purchase): void
    {
        if ($purchase->status === 'confirmed') {
            throw ValidationException::withMessages([
                'purchase' => ['Un achat confirme ne peut pas etre supprime.'],
            ]);
        }

        DB::transaction(function () use ($purchase): void {
            $this->deleteAttachment($purchase->attachment_path);
            $purchase->delete();
        });
    }

    private function prepareItems(array $rawItems): array
    {
        return collect($rawItems)
            ->map(function (array $item): array {
                $product = Product::query()->findOrFail($item['product_id']);
                $quantity = round((float) $item['quantity'], 3);
                $unitCostHt = round((float) $item['unit_cost_ht'], 2);
                $vatRate = round((float) $item['vat_rate'], 2);
                $subtotalHt = round($quantity * $unitCostHt, 2);
                $vatAmount = round($subtotalHt * ($vatRate / 100), 2);
                $subtotalTtc = round($subtotalHt + $vatAmount, 2);

                return [
                    'product_id' => $product->id,
                    'product_name_snapshot' => $product->name,
                    'quantity' => $quantity,
                    'unit_cost_ht' => $unitCostHt,
                    'vat_rate' => $vatRate,
                    'vat_amount' => $vatAmount,
                    'subtotal_ht' => $subtotalHt,
                    'subtotal_ttc' => $subtotalTtc,
                ];
            })
            ->values()
            ->all();
    }

    private function totals(array $items): array
    {
        return [
            'subtotal_ht' => round(array_sum(array_column($items, 'subtotal_ht')), 2),
            'total_vat' => round(array_sum(array_column($items, 'vat_amount')), 2),
            'total_ttc' => round(array_sum(array_column($items, 'subtotal_ttc')), 2),
        ];
    }

    private function storeAttachment(UploadedFile $attachment, ?string $purchaseNumber): string
    {
        $directory = $purchaseNumber ? "purchases/{$purchaseNumber}" : 'purchases/tmp';
        return $attachment->store($directory, 'local');
    }

    private function moveAttachmentToPurchaseDirectory(string $path, string $purchaseNumber): string
    {
        $filename = basename($path);
        $newPath = "purchases/{$purchaseNumber}/{$filename}";

        if ($path === $newPath) {
            return $path;
        }

        Storage::disk('local')->move($path, $newPath);

        return $newPath;
    }

    private function deleteAttachment(?string $path): void
    {
        if ($path) {
            Storage::disk('local')->delete($path);
        }
    }

    private function refreshProductPurchaseStats(array $productIds): void
    {
        $ids = collect($productIds)->filter()->unique()->values();

        foreach ($ids as $productId) {
            $product = Product::query()->find($productId);

            if (! $product) {
                continue;
            }

            $confirmedItems = DB::table('purchase_items')
                ->join('purchases', 'purchases.id', '=', 'purchase_items.purchase_id')
                ->where('purchase_items.product_id', $productId)
                ->where('purchases.status', 'confirmed');

            $aggregate = (clone $confirmedItems)
                ->selectRaw('SUM(purchase_items.quantity) as total_quantity, SUM(purchase_items.subtotal_ht) as total_ht')
                ->first();

            $latest = (clone $confirmedItems)
                ->orderByDesc('purchases.purchase_date')
                ->orderByDesc('purchase_items.id')
                ->select('purchase_items.unit_cost_ht', 'purchases.purchase_date')
                ->first();

            $averageCost = ($aggregate?->total_quantity ?? 0) > 0
                ? round(((float) $aggregate->total_ht) / ((float) $aggregate->total_quantity), 2)
                : null;

            $product->update([
                'average_purchase_cost_ht' => $averageCost,
                'last_purchase_cost_ht' => $latest?->unit_cost_ht !== null ? round((float) $latest->unit_cost_ht, 2) : null,
                'last_purchased_at' => $latest?->purchase_date ?? null,
            ]);
        }
    }
}
