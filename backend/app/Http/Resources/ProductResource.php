<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'image' => $this->imageUrl(),
            'image_path' => $this->image,
            'price' => (float) $this->price,
            'average_purchase_cost_ht' => $this->average_purchase_cost_ht !== null ? (float) $this->average_purchase_cost_ht : null,
            'last_purchase_cost_ht' => $this->last_purchase_cost_ht !== null ? (float) $this->last_purchase_cost_ht : null,
            'last_purchased_at' => $this->last_purchased_at?->toISOString(),
            'stock' => (float) $this->stock,
            'alert_threshold' => (float) ($this->alert_threshold ?? 0),
            'stock_status' => $this->stockStatus(),
            'last_stock_update_at' => $this->last_stock_update_at?->toISOString(),
            'is_available' => $this->is_available,
            'is_featured' => $this->is_featured,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    private function imageUrl(): ?string
    {
        if (! $this->image) {
            return null;
        }

        if (str_starts_with($this->image, 'http://') || str_starts_with($this->image, 'https://')) {
            return $this->image;
        }

        return url(Storage::disk('public')->url($this->image));
    }

    private function stockStatus(): string
    {
        $stock = (float) $this->stock;
        $threshold = (float) ($this->alert_threshold ?? 0);

        if ($stock <= 0) {
            return 'out_of_stock';
        }

        if ($stock <= $threshold) {
            return 'low_stock';
        }

        return 'in_stock';
    }
}
