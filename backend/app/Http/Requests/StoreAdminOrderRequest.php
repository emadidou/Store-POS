<?php

namespace App\Http\Requests;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAdminOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $customer = $this->input('customer', []);

        if (is_array($customer)) {
            $this->merge([
                'full_name' => $this->input('full_name', $customer['full_name'] ?? null),
                'phone' => $this->input('phone', $customer['phone'] ?? null),
                'email' => $this->input('email', $customer['email'] ?? null),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'full_name' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:255'],
            'pickup_date' => ['required', 'date_format:Y-m-d'],
            'pickup_time' => ['required', 'date_format:H:i'],
            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],
            'status' => ['nullable', Rule::enum(OrderStatus::class)],
            'notes' => ['nullable', 'string', 'max:2000'],
            'source' => ['nullable', 'string', 'max:80'],
            'order_type' => ['nullable', Rule::in(['in_store', 'pickup', 'reservation'])],
            'is_paid' => ['boolean'],
            'payment_captured' => ['nullable', 'boolean'],
            'payment_status' => ['nullable', Rule::enum(PaymentStatus::class)],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
        ];
    }
}
