<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplier_id,
            'supplier' => new SupplierResource($this->whenLoaded('supplier')),
            'purchase_number' => $this->purchase_number,
            'external_invoice_number' => $this->external_invoice_number,
            'external_invoice_date' => $this->external_invoice_date?->toDateString(),
            'purchase_date' => $this->purchase_date?->toDateString(),
            'status' => $this->status,
            'subtotal_ht' => (float) $this->subtotal_ht,
            'total_vat' => (float) $this->total_vat,
            'total_ttc' => (float) $this->total_ttc,
            'payment_status' => $this->payment_status,
            'payment_method' => $this->payment_method,
            'paid_at' => $this->paid_at?->toISOString(),
            'notes' => $this->notes,
            'attachment_path' => $this->attachment_path,
            'has_attachment' => (bool) $this->attachment_path,
            'attachment_url' => $this->attachment_path ? url("/api/admin/purchases/{$this->id}/attachment") : null,
            'attachment_download_url' => $this->attachment_path ? url("/api/admin/purchases/{$this->id}/attachment/download") : null,
            'confirmed_at' => $this->confirmed_at?->toISOString(),
            'cancelled_at' => $this->cancelled_at?->toISOString(),
            'stock_applied_at' => $this->stock_applied_at?->toISOString(),
            'items' => PurchaseItemResource::collection($this->whenLoaded('items')),
            'stock_movements' => StockMovementResource::collection($this->whenLoaded('stockMovements')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
