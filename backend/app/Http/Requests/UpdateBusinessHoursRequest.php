<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBusinessHoursRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'hours' => ['required', 'array', 'size:7'],
            'hours.*.day_of_week' => ['required', 'integer', 'between:0,6'],
            'hours.*.open_time' => ['nullable', 'date_format:H:i', 'required_if:hours.*.is_closed,false'],
            'hours.*.close_time' => ['nullable', 'date_format:H:i', 'after:hours.*.open_time', 'required_if:hours.*.is_closed,false'],
            'hours.*.is_closed' => ['required', 'boolean'],
        ];
    }
}
