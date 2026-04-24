<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['order_id', 'product_id', 'product_name_snapshot', 'unit_price', 'unit_price_ht', 'unit_price_ttc', 'vat_rate', 'vat_amount', 'quantity', 'subtotal', 'subtotal_ht', 'subtotal_ttc'])]
class OrderItem extends Model
{
    use HasFactory;

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    protected function casts(): array
    {
        return [
            'unit_price' => 'decimal:2',
            'unit_price_ht' => 'decimal:2',
            'unit_price_ttc' => 'decimal:2',
            'vat_rate' => 'decimal:2',
            'vat_amount' => 'decimal:2',
            'quantity' => 'decimal:3',
            'subtotal' => 'decimal:2',
            'subtotal_ht' => 'decimal:2',
            'subtotal_ttc' => 'decimal:2',
        ];
    }
}
