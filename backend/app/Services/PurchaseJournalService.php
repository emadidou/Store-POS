<?php

namespace App\Services;

use App\Models\Purchase;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class PurchaseJournalService
{
    public function paginated(array $filters, int $perPage = 25): LengthAwarePaginator
    {
        return $this->query($filters)
            ->latest('purchase_date')
            ->paginate($perPage)
            ->through(fn (Purchase $purchase) => $this->row($purchase));
    }

    public function rows(array $filters): array
    {
        return $this->query($filters)
            ->orderBy('purchase_date')
            ->get()
            ->map(fn (Purchase $purchase) => $this->row($purchase))
            ->all();
    }

    public function query(array $filters): Builder
    {
        return Purchase::query()
            ->with('supplier')
            ->when($filters['supplier_id'] ?? null, fn (Builder $query, $supplierId) => $query->where('supplier_id', $supplierId))
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($filters['payment_status'] ?? null, fn (Builder $query, string $status) => $query->where('payment_status', $status))
            ->when(array_key_exists('has_attachment', $filters) && $filters['has_attachment'] !== '', function (Builder $query) use ($filters): void {
                if ((string) $filters['has_attachment'] === '1') {
                    $query->whereNotNull('attachment_path');
                } elseif ((string) $filters['has_attachment'] === '0') {
                    $query->whereNull('attachment_path');
                }
            })
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('purchase_date', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('purchase_date', '<=', $date))
            ->where('status', 'confirmed');
    }

    public function row(Purchase $purchase): array
    {
        return [
            'date_purchase' => $purchase->purchase_date?->toDateString(),
            'purchase_number' => $purchase->purchase_number,
            'supplier_name' => $purchase->supplier?->name,
            'external_invoice_number' => $purchase->external_invoice_number,
            'amount_ht' => (float) $purchase->subtotal_ht,
            'amount_vat' => (float) $purchase->total_vat,
            'amount_ttc' => (float) $purchase->total_ttc,
            'payment_status' => $purchase->payment_status,
            'payment_method' => $purchase->payment_method,
            'has_attachment' => (bool) $purchase->attachment_path,
            'notes' => $purchase->notes,
        ];
    }

    public function stats(array $filters = []): array
    {
        $rows = collect($this->rows($filters));
        $monthStart = now()->startOfMonth()->toDateString();
        $monthRows = $rows->filter(fn (array $row) => ($row['date_purchase'] ?? '') >= $monthStart);

        $suppliers = $this->query($filters)
            ->selectRaw('supplier_id, SUM(total_ttc) as total_ttc_sum')
            ->whereNotNull('supplier_id')
            ->groupBy('supplier_id')
            ->with('supplier')
            ->orderByDesc('total_ttc_sum')
            ->limit(5)
            ->get()
            ->map(fn (Purchase $purchase) => [
                'supplier' => $purchase->supplier?->name ?? 'Sans fournisseur',
                'total_ttc' => (float) $purchase->total_ttc_sum,
            ])
            ->all();

        $productQuery = Purchase::query()
            ->join('purchase_items', 'purchase_items.purchase_id', '=', 'purchases.id')
            ->join('products', 'products.id', '=', 'purchase_items.product_id')
            ->where('purchases.status', 'confirmed')
            ->when($filters['supplier_id'] ?? null, fn ($query, $supplierId) => $query->where('purchases.supplier_id', $supplierId))
            ->when($filters['payment_status'] ?? null, fn ($query, $status) => $query->where('purchases.payment_status', $status))
            ->when($filters['date_from'] ?? null, fn ($query, $date) => $query->whereDate('purchases.purchase_date', '>=', $date))
            ->when($filters['date_to'] ?? null, fn ($query, $date) => $query->whereDate('purchases.purchase_date', '<=', $date));

        $products = $productQuery
            ->selectRaw('products.name as product_name, SUM(purchase_items.quantity) as total_quantity')
            ->groupBy('products.name')
            ->orderByDesc('total_quantity')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'product' => $row->product_name,
                'quantity' => (float) $row->total_quantity,
            ])
            ->all();

        $dailySeries = $this->query($filters)
            ->whereDate('purchase_date', '>=', now()->subDays(29)->toDateString())
            ->selectRaw('DATE(purchase_date) as day, SUM(total_ttc) as total_ttc_sum, SUM(total_vat) as total_vat_sum')
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->map(fn ($row) => [
                'date' => $row->day,
                'total_ttc' => (float) $row->total_ttc_sum,
                'total_vat' => (float) $row->total_vat_sum,
            ])
            ->all();

        return [
            'month_total_ttc' => round((float) $monthRows->sum('amount_ttc'), 2),
            'month_total_vat' => round((float) $monthRows->sum('amount_vat'), 2),
            'suppliers' => $suppliers,
            'products' => $products,
            'daily_series' => $dailySeries,
        ];
    }
}
