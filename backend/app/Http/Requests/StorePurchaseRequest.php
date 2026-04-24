<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'supplier_id' => ['nullable', 'integer', 'exists:suppliers,id'],
            'external_invoice_number' => ['nullable', 'string', 'max:128'],
            'external_invoice_date' => ['nullable', 'date'],
            'purchase_date' => ['required', 'date'],
            'status' => ['nullable', 'in:draft,confirmed,cancelled'],
            'payment_status' => ['nullable', 'in:unpaid,paid,partial'],
            'payment_method' => ['nullable', 'string', 'max:32'],
            'paid_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'attachment' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:8192'],
            'remove_attachment' => ['nullable', 'boolean'],
            'items' => ['nullable', 'array'],
            'items.*.product_id' => ['required_with:items', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required_with:items', 'numeric', 'gt:0'],
            'items.*.unit_cost_ht' => ['required_with:items', 'numeric', 'min:0'],
            'items.*.vat_rate' => ['required_with:items', 'numeric', 'min:0', 'max:100'],
        ];
    }
}
