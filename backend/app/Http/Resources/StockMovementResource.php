<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockMovementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'purchase_id' => $this->purchase_id,
            'product' => new ProductResource($this->whenLoaded('product')),
            'type' => $this->type,
            'quantity' => (float) $this->quantity,
            'previous_stock' => (float) $this->previous_stock,
            'new_stock' => (float) $this->new_stock,
            'reason' => $this->reason,
            'source' => $this->source,
            'reference' => $this->reference,
            'note' => $this->note,
            'created_by' => $this->created_by,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
