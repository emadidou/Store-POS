<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['category_id', 'name', 'slug', 'description', 'image', 'price', 'average_purchase_cost_ht', 'last_purchase_cost_ht', 'last_purchased_at', 'stock', 'alert_threshold', 'last_stock_update_at', 'is_available', 'is_featured'])]
class Product extends Model
{
    use HasFactory;

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function scopeSellable(Builder $query): Builder
    {
        return $query->where('is_available', true)->where('stock', '>', 0);
    }

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'average_purchase_cost_ht' => 'decimal:2',
            'last_purchase_cost_ht' => 'decimal:2',
            'stock' => 'decimal:3',
            'alert_threshold' => 'decimal:3',
            'last_purchased_at' => 'datetime',
            'last_stock_update_at' => 'datetime',
            'is_available' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }
}
