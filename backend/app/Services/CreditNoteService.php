<?php

namespace App\Services;

use App\Enums\DocumentType;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\Documents\CreditNoteNumberGenerator;
use App\Services\Tax\TaxCalculator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CreditNoteService
{
    public function __construct(
        private readonly CreditNoteNumberGenerator $creditNoteNumberGenerator,
        private readonly StockService $stockService,
        private readonly TaxCalculator $taxCalculator,
    ) {
    }

    public function create(Order $invoice, array $data): Order
    {
        return DB::transaction(function () use ($invoice, $data): Order {
            $invoice = Order::query()
                ->with(['customer', 'items.product', 'creditNotes.items'])
                ->lockForUpdate()
                ->findOrFail($invoice->id);

            $this->assertEligibleInvoice($invoice);

            $remainingQuantities = $this->remainingQuantities($invoice);
            $requestedQuantities = $this->requestedQuantities($invoice, $data, $remainingQuantities);
            $creditItems = $this->buildCreditItems($invoice, $requestedQuantities);

            if ($creditItems === []) {
                throw ValidationException::withMessages([
                    'items' => ['Aucune ligne admissible pour cet avoir.'],
                ]);
            }

            $restoreStock = (bool) ($data['restore_stock'] ?? true);
            $now = now();
            $totals = $this->taxCalculator->totals($creditItems);
            $isFullCredit = $this->isFullCredit($remainingQuantities, $requestedQuantities);

            $creditNote = Order::query()->create([
                'customer_id' => $invoice->customer_id,
                'original_order_id' => $invoice->id,
                'order_number' => $this->generateOrderNumber(),
                'voucher_token' => $this->generateVoucherToken(),
                'status' => OrderStatus::Cancelled,
                ...$totals,
                'vat_rate' => $invoice->vat_rate,
                'vat_regime' => $invoice->vat_regime,
                'legal_note' => $invoice->legal_note,
                'pickup_date' => $invoice->pickup_date,
                'pickup_time' => $invoice->pickup_time,
                'payment_method' => $invoice->payment_method,
                'notes' => $invoice->notes,
                'source' => 'admin',
                'order_type' => $invoice->order_type,
                'is_paid' => true,
                'payment_status' => PaymentStatus::Paid,
                'document_type' => DocumentType::CreditNote,
                'invoice_number' => null,
                'credit_note_number' => $this->creditNoteNumberGenerator->generate(),
                'paid_at' => null,
                'refunded_at' => $now,
                'refund_reason' => $data['reason'],
                'refund_amount' => abs((float) $totals['total_ttc']),
                'cancelled_at' => $now,
                'stock_restored_at' => $restoreStock ? $now : null,
            ]);

            $creditNote->items()->createMany($creditItems);

            if ($restoreStock) {
                $this->restoreStockFromCreditItems($invoice, $requestedQuantities);
            }

            $invoice->forceFill([
                'status' => $isFullCredit ? OrderStatus::Cancelled : $invoice->status,
                'cancelled_at' => $isFullCredit ? $now : $invoice->cancelled_at,
                'refunded_at' => $isFullCredit ? $now : $invoice->refunded_at,
            ])->save();

            return $creditNote->refresh()->load(['customer', 'items.product.category', 'originalOrder.customer']);
        });
    }

    public function forInvoice(Order $invoice): Collection
    {
        return Order::query()
            ->with(['customer', 'items.product.category', 'originalOrder.customer'])
            ->where('original_order_id', $invoice->id)
            ->where('document_type', DocumentType::CreditNote->value)
            ->latest('refunded_at')
            ->get();
    }

    public function list(array $filters = [])
    {
        return Order::query()
            ->with(['customer', 'originalOrder.customer'])
            ->where('document_type', DocumentType::CreditNote->value)
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('credit_note_number', 'like', "%{$search}%")
                        ->orWhere('order_number', 'like', "%{$search}%")
                        ->orWhere('refund_reason', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($query) use ($search): void {
                            $query
                                ->where('full_name', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        })
                        ->orWhereHas('originalOrder', function ($query) use ($search): void {
                            $query
                                ->where('invoice_number', 'like', "%{$search}%")
                                ->orWhere('order_number', 'like', "%{$search}%");
                        });
                });
            })
            ->latest('refunded_at');
    }

    private function assertEligibleInvoice(Order $invoice): void
    {
        $documentType = $invoice->document_type?->value ?? $invoice->document_type;
        $paymentStatus = $invoice->payment_status?->value ?? $invoice->payment_status;

        if ($documentType !== DocumentType::Invoice->value || ! $invoice->invoice_number) {
            throw ValidationException::withMessages([
                'order' => ['Un avoir ne peut etre genere que pour une facture existante.'],
            ]);
        }

        if ($paymentStatus !== PaymentStatus::Paid->value || ! $invoice->is_paid) {
            throw ValidationException::withMessages([
                'order' => ['Seule une facture payee peut recevoir un avoir.'],
            ]);
        }
    }

    private function remainingQuantities(Order $invoice): Collection
    {
        $creditedQuantities = $invoice->creditNotes
            ->flatMap(fn (Order $creditNote) => $creditNote->items)
            ->groupBy('product_id')
            ->map(fn (Collection $items) => (float) $items->sum(fn (OrderItem $item) => abs((float) $item->quantity)));

        return $invoice->items
            ->groupBy('product_id')
            ->map(function (Collection $items, int|string $productId) use ($creditedQuantities): float {
                $orderedQuantity = (float) $items->sum(fn (OrderItem $item) => (float) $item->quantity);
                $creditedQuantity = (float) ($creditedQuantities->get($productId, 0.0));
                return max(0, round($orderedQuantity - $creditedQuantity, 3));
            });
    }

    private function requestedQuantities(Order $invoice, array $data, Collection $remainingQuantities): Collection
    {
        if (($data['mode'] ?? 'partial') === 'full') {
            if ($invoice->creditNotes->isNotEmpty()) {
                throw ValidationException::withMessages([
                    'mode' => ['Un avoir total ne peut etre cree quune seule fois par facture.'],
                ]);
            }

            return $remainingQuantities->filter(fn (float $quantity) => $quantity > 0);
        }

        $requested = collect($data['items'] ?? [])
            ->groupBy('product_id')
            ->map(fn (Collection $items) => round((float) $items->sum('quantity'), 3))
            ->filter(fn (float $quantity) => $quantity > 0);

        if ($requested->isEmpty()) {
            throw ValidationException::withMessages([
                'items' => ['Selectionnez au moins un produit pour un avoir partiel.'],
            ]);
        }

        foreach ($requested as $productId => $quantity) {
            $remaining = (float) $remainingQuantities->get($productId, 0.0);

            if ($remaining <= 0) {
                throw ValidationException::withMessages([
                    'items' => ['Ce produit a deja ete entierement rembourse.'],
                ]);
            }

            if ($quantity > $remaining) {
                throw ValidationException::withMessages([
                    'items' => ['La quantite demandee depasse le reliquat remboursable.'],
                ]);
            }
        }

        return $requested;
    }

    private function buildCreditItems(Order $invoice, Collection $requestedQuantities): array
    {
        $invoice->items->loadMissing('product');

        return $invoice->items
            ->filter(fn (OrderItem $item) => (float) ($requestedQuantities->get($item->product_id, 0.0)) > 0)
            ->map(function (OrderItem $item) use ($requestedQuantities): array {
                $quantity = (float) $requestedQuantities->get($item->product_id, 0.0);
                $ratio = (float) $item->quantity > 0 ? $quantity / (float) $item->quantity : 0;

                return [
                    'product_id' => $item->product_id,
                    'product_name_snapshot' => $item->product_name_snapshot,
                    'unit_price' => $item->unit_price,
                    'unit_price_ht' => $item->unit_price_ht,
                    'unit_price_ttc' => $item->unit_price_ttc,
                    'vat_rate' => $item->vat_rate,
                    'vat_amount' => -round((float) $item->vat_amount * $ratio, 2),
                    'quantity' => -$quantity,
                    'subtotal' => -round((float) $item->subtotal_ttc * $ratio, 2),
                    'subtotal_ht' => -round((float) $item->subtotal_ht * $ratio, 2),
                    'subtotal_ttc' => -round((float) $item->subtotal_ttc * $ratio, 2),
                ];
            })
            ->values()
            ->all();
    }

    private function restoreStockFromCreditItems(Order $invoice, Collection $requestedQuantities): void
    {
        $invoice->items->loadMissing('product');

        foreach ($invoice->items as $item) {
            $quantity = (float) ($requestedQuantities->get($item->product_id, 0.0));

            if ($quantity <= 0 || ! $item->product) {
                continue;
            }

            $this->stockService->increase(
                $item->product,
                $quantity,
                'Avoir client',
                'credit_note',
                "Retour stock apres avoir {$item->product_name_snapshot}",
            );
        }
    }

    private function isFullCredit(Collection $remainingQuantities, Collection $requestedQuantities): bool
    {
        foreach ($remainingQuantities as $productId => $remaining) {
            if (round((float) $remaining, 3) !== round((float) ($requestedQuantities->get($productId, 0.0)), 3)) {
                return false;
            }
        }

        return true;
    }

    private function generateOrderNumber(): string
    {
        do {
            $orderNumber = 'MV-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
        } while (Order::query()->where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }

    private function generateVoucherToken(): string
    {
        do {
            $token = Str::random(48);
        } while (Order::query()->where('voucher_token', $token)->exists());

        return $token;
    }
}
