<?php

namespace App\Services\Sales;

use App\Enums\PaymentStatus;
use App\Enums\DocumentType;
use App\Models\Order;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class SalesJournalService
{
    public function paginated(array $filters, int $perPage = 25): LengthAwarePaginator
    {
        return $this->query($filters)
            ->latest('created_at')
            ->paginate($perPage)
            ->through(fn (Order $order) => $this->row($order));
    }

    public function rows(array $filters): array
    {
        return $this->query($filters)
            ->orderBy('created_at')
            ->get()
            ->map(fn (Order $order) => $this->row($order))
            ->all();
    }

    public function query(array $filters): Builder
    {
        return Order::query()
            ->with(['customer', 'originalOrder'])
            ->when(($filters['period_type'] ?? null) === 'day', fn (Builder $query) => $query->whereDate('created_at', $filters['date']))
            ->when(($filters['period_type'] ?? null) === 'month', function (Builder $query) use ($filters): void {
                [$year, $month] = explode('-', $filters['month']);
                $query->whereYear('created_at', $year)->whereMonth('created_at', $month);
            })
            ->when(($filters['period_type'] ?? null) === 'year', fn (Builder $query) => $query->whereYear('created_at', $filters['year']))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('created_at', '<=', $date))
            ->when($filters['source'] ?? null, fn (Builder $query, string $source) => $query->where('source', $source))
            ->when($filters['payment_method'] ?? null, fn (Builder $query, string $method) => $query->where('payment_method', $method))
            ->when($filters['payment_status'] ?? null, fn (Builder $query, string $status) => $query->where('payment_status', $status))
            ->when($filters['document_types'] ?? null, fn (Builder $query, array $types) => $query->whereIn('document_type', $types))
            ->when($filters['document_type'] ?? null, fn (Builder $query, string $type) => $query->where('document_type', $type));
    }

    public function row(Order $order): array
    {
        return [
            'date_document' => $order->paid_at?->toDateString() ?? $order->created_at?->toDateString(),
            'order_number' => $order->order_number,
            'document_type' => $order->document_type?->value ?? $order->document_type,
            'invoice_number' => $order->invoice_number,
            'credit_note_number' => $order->credit_note_number,
            'original_invoice_number' => $order->originalOrder?->invoice_number,
            'original_order_number' => $order->originalOrder?->order_number,
            'customer_name' => $order->customer?->full_name,
            'amount_ht' => (float) $order->subtotal_ht,
            'amount_vat' => (float) $order->total_vat,
            'amount_ttc' => (float) $order->total_ttc,
            'payment_method' => $order->payment_method?->value ?? $order->payment_method,
            'source' => $order->source,
            'payment_status' => $order->payment_status?->value ?? $order->payment_status ?? PaymentStatus::Pending->value,
            'order_status' => $order->status?->value ?? $order->status,
            'vat_rate' => $order->vat_rate !== null ? (float) $order->vat_rate : null,
            'vat_regime' => $order->vat_regime?->value ?? $order->vat_regime,
            'refund_reason' => $order->refund_reason,
            'entry_type' => $this->entryType($order),
        ];
    }

    private function entryType(Order $order): string
    {
        $documentType = $order->document_type?->value ?? $order->document_type;
        $status = $order->status?->value ?? $order->status;

        if ($documentType === DocumentType::CreditNote->value) {
            return 'credit_note';
        }

        if ($documentType === 'invoice' && $status === 'cancelled') {
            return 'cancelled_invoice';
        }

        if ($documentType === 'invoice') {
            return 'paid_sale';
        }

        if ($status === 'cancelled') {
            return 'cancelled_voucher';
        }

        return 'order_voucher';
    }
}
