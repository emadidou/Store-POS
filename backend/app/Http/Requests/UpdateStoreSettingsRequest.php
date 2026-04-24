<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStoreSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'store_name' => ['required', 'string', 'max:255'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'legal_form' => ['nullable', 'string', 'max:80'],
            'share_capital' => ['nullable', 'numeric', 'min:0', 'max:9999999999.99'],
            'phone' => ['required', 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
            'siret' => ['nullable', 'string', 'max:32'],
            'siren' => ['nullable', 'string', 'max:16'],
            'ape_code' => ['nullable', 'string', 'max:16'],
            'vat_number' => ['nullable', 'string', 'max:48'],
            'rc' => ['nullable', 'string', 'max:48'],
            'rcs_city' => ['nullable', 'string', 'max:120'],
            'ice' => ['nullable', 'string', 'max:48'],
            'vat_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'vat_exempt' => ['boolean'],
            'vat_regime' => ['nullable', Rule::in(['standard', 'franchise_base'])],
            'default_vat_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'legal_vat_note' => ['nullable', 'string', 'max:255'],
            'pickup_buffer_minutes' => ['required', 'integer', 'min:0', 'max:240'],
            'currency' => ['required', 'string', 'size:3'],
            'timezone' => ['required', 'timezone'],
            'open_message' => ['nullable', 'string', 'max:255'],
            'closed_message' => ['nullable', 'string', 'max:255'],
        ];
    }
}
