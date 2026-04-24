<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['store_name', 'company_name', 'legal_form', 'share_capital', 'phone', 'email', 'address', 'siret', 'siren', 'ape_code', 'vat_number', 'rc', 'rcs_city', 'ice', 'vat_rate', 'vat_exempt', 'vat_regime', 'default_vat_rate', 'legal_vat_note', 'pickup_buffer_minutes', 'currency', 'timezone', 'open_message', 'closed_message'])]
class StoreSetting extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'pickup_buffer_minutes' => 'integer',
            'share_capital' => 'decimal:2',
            'vat_rate' => 'decimal:2',
            'vat_exempt' => 'boolean',
            'default_vat_rate' => 'decimal:2',
        ];
    }
}
