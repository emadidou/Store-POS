<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoreStatusResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'is_open' => $this->resource['is_open'],
            'message' => $this->resource['message'],
            'opens_at' => $this->resource['opens_at'],
            'closes_at' => $this->resource['closes_at'],
            'timezone' => $this->resource['timezone'],
        ];
    }
}
