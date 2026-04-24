<?php

namespace App\Http\Requests;

use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
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

        // Public checkout is always an online pickup flow. Sensitive accounting
        // fields are decided server-side only.
        $this->merge([
            'source' => 'web',
            'order_type' => 'pickup',
        ]);
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:255'],
            'pickup_date' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'pickup_time' => ['required', 'date_format:H:i'],
            'payment_method' => ['required', Rule::in([PaymentMethod::Cash->value, PaymentMethod::StripeLaterReady->value])],
            'notes' => ['nullable', 'string', 'max:2000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
        ];
    }
}
