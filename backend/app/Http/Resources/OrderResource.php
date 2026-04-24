<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'voucher_token' => $this->when($this->voucher_token && $request->is('api/orders'), $this->voucher_token),
            'status' => $this->status?->value ?? $this->status,
            'total_amount' => (float) $this->total_amount,
            'subtotal_ht' => (float) $this->subtotal_ht,
            'total_vat' => (float) $this->total_vat,
            'total_ttc' => (float) $this->total_ttc,
            'vat_rate' => $this->vat_rate !== null ? (float) $this->vat_rate : null,
            'vat_regime' => $this->vat_regime?->value ?? $this->vat_regime,
            'legal_note' => $this->legal_note,
            'pickup_date' => $this->pickup_date?->toDateString(),
            'pickup_time' => substr((string) $this->pickup_time, 0, 5),
            'payment_method' => $this->payment_method?->value ?? $this->payment_method,
            'notes' => $this->notes,
            'source' => $this->source,
            'order_type' => $this->order_type,
            'is_paid' => (bool) $this->is_paid,
            'payment_status' => $this->payment_status?->value ?? $this->payment_status,
            'document_type' => $this->document_type?->value ?? $this->document_type,
            'invoice_number' => $this->invoice_number,
            'credit_note_number' => $this->credit_note_number,
            'paid_at' => $this->paid_at?->toISOString(),
            'refunded_at' => $this->refunded_at?->toISOString(),
            'refund_reason' => $this->refund_reason,
            'refund_amount' => $this->refund_amount !== null ? (float) $this->refund_amount : null,
            'cancelled_at' => $this->cancelled_at?->toISOString(),
            'stock_restored_at' => $this->stock_restored_at?->toISOString(),
            'original_order' => $this->when(
                $this->relationLoaded('originalOrder') && $this->originalOrder,
                fn () => [
                    'id' => $this->originalOrder?->id,
                    'order_number' => $this->originalOrder?->order_number,
                    'invoice_number' => $this->originalOrder?->invoice_number,
                ],
            ),
            'customer' => [
                'id' => $this->customer?->id,
                'full_name' => $this->customer?->full_name,
                'phone' => $this->customer?->phone,
                'email' => $this->customer?->email,
            ],
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'credit_notes' => OrderResource::collection($this->whenLoaded('creditNotes')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
