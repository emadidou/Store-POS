<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'supplier_id',
    'purchase_number',
    'external_invoice_number',
    'external_invoice_date',
    'purchase_date',
    'status',
    'subtotal_ht',
    'total_vat',
    'total_ttc',
    'payment_status',
    'payment_method',
    'paid_at',
    'notes',
    'attachment_path',
    'confirmed_at',
    'cancelled_at',
    'stock_applied_at',
])]
class Purchase extends Model
{
    use HasFactory;

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseItem::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    protected function casts(): array
    {
        return [
            'purchase_date' => 'date',
            'external_invoice_date' => 'date',
            'subtotal_ht' => 'decimal:2',
            'total_vat' => 'decimal:2',
            'total_ttc' => 'decimal:2',
            'paid_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'stock_applied_at' => 'datetime',
        ];
    }
}
