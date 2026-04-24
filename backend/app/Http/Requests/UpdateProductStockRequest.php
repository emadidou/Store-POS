<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'stock' => ['sometimes', 'required', 'numeric', 'min:0'],
            'alert_threshold' => ['sometimes', 'required', 'numeric', 'min:0'],
            'is_available' => ['sometimes', 'required', 'boolean'],
            'reason' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
