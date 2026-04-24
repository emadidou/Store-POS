<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product' => new ProductResource($this->whenLoaded('product')),
            'product_name_snapshot' => $this->product_name_snapshot,
            'unit_price' => (float) $this->unit_price,
            'unit_price_ht' => (float) $this->unit_price_ht,
            'unit_price_ttc' => (float) $this->unit_price_ttc,
            'vat_rate' => $this->vat_rate !== null ? (float) $this->vat_rate : null,
            'vat_amount' => (float) $this->vat_amount,
            'quantity' => (float) $this->quantity,
            'subtotal' => (float) $this->subtotal,
            'subtotal_ht' => (float) $this->subtotal_ht,
            'subtotal_ttc' => (float) $this->subtotal_ttc,
        ];
    }
}
