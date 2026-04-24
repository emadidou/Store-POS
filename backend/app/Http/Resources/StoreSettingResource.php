<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoreSettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'store_name' => $this->store_name,
            'company_name' => $this->company_name,
            'legal_form' => $this->legal_form,
            'share_capital' => $this->share_capital !== null ? (float) $this->share_capital : null,
            'phone' => $this->phone,
            'email' => $this->email,
            'address' => $this->address,
            'siret' => $this->siret,
            'siren' => $this->siren,
            'ape_code' => $this->ape_code,
            'vat_number' => $this->vat_number,
            'rc' => $this->rc,
            'rcs_city' => $this->rcs_city,
            'ice' => $this->ice,
            'vat_rate' => $this->vat_rate !== null ? (float) $this->vat_rate : null,
            'vat_exempt' => (bool) $this->vat_exempt,
            'vat_regime' => $this->vat_regime,
            'default_vat_rate' => $this->default_vat_rate !== null ? (float) $this->default_vat_rate : null,
            'legal_vat_note' => $this->legal_vat_note,
            'pickup_buffer_minutes' => $this->pickup_buffer_minutes,
            'currency' => $this->currency,
            'timezone' => $this->timezone,
            'open_message' => $this->open_message,
            'closed_message' => $this->closed_message,
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
