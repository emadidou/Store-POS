<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['product_id', 'purchase_id', 'type', 'quantity', 'previous_stock', 'new_stock', 'reason', 'source', 'reference', 'note', 'created_by'])]
class StockMovement extends Model
{
    use HasFactory;

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function purchase(): BelongsTo
    {
        return $this->belongsTo(Purchase::class);
    }

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:3',
            'previous_stock' => 'decimal:3',
            'new_stock' => 'decimal:3',
        ];
    }
}
