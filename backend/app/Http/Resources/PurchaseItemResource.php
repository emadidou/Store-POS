<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'purchase_id' => $this->purchase_id,
            'product_id' => $this->product_id,
            'product_name_snapshot' => $this->product_name_snapshot,
            'quantity' => (float) $this->quantity,
            'unit_cost_ht' => (float) $this->unit_cost_ht,
            'vat_rate' => (float) $this->vat_rate,
            'vat_amount' => (float) $this->vat_amount,
            'subtotal_ht' => (float) $this->subtotal_ht,
            'subtotal_ttc' => (float) $this->subtotal_ttc,
            'product' => new ProductResource($this->whenLoaded('product')),
        ];
    }
}
