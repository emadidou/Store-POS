<?php

namespace App\Models;

use App\Enums\DocumentType;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\PaymentMethod;
use App\Enums\VatRegime;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['customer_id', 'original_order_id', 'order_number', 'voucher_token', 'status', 'total_amount', 'subtotal_ht', 'total_vat', 'total_ttc', 'vat_rate', 'vat_regime', 'legal_note', 'pickup_date', 'pickup_time', 'payment_method', 'notes', 'source', 'order_type', 'is_paid', 'payment_status', 'document_type', 'invoice_number', 'credit_note_number', 'paid_at', 'refunded_at', 'refund_reason', 'refund_amount', 'cancelled_at', 'stock_restored_at'])]
class Order extends Model
{
    use HasFactory;

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function originalOrder(): BelongsTo
    {
        return $this->belongsTo(self::class, 'original_order_id');
    }

    public function creditNotes(): HasMany
    {
        return $this->hasMany(self::class, 'original_order_id');
    }

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'payment_method' => PaymentMethod::class,
            'payment_status' => PaymentStatus::class,
            'document_type' => DocumentType::class,
            'vat_regime' => VatRegime::class,
            'total_amount' => 'decimal:2',
            'subtotal_ht' => 'decimal:2',
            'total_vat' => 'decimal:2',
            'total_ttc' => 'decimal:2',
            'vat_rate' => 'decimal:2',
            'pickup_date' => 'date',
            'is_paid' => 'boolean',
            'paid_at' => 'datetime',
            'refunded_at' => 'datetime',
            'refund_amount' => 'decimal:2',
            'cancelled_at' => 'datetime',
            'stock_restored_at' => 'datetime',
        ];
    }
}
