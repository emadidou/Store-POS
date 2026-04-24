<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateStoreSettingsRequest;
use App\Http\Resources\StoreSettingResource;
use App\Models\StoreSetting;

class StoreSettingController extends Controller
{
    public function show(): StoreSettingResource
    {
        return new StoreSettingResource($this->settings());
    }

    public function update(UpdateStoreSettingsRequest $request): StoreSettingResource
    {
        $settings = $this->settings();
        $settings->update($request->validated());

        return new StoreSettingResource($settings->refresh());
    }

    private function settings(): StoreSetting
    {
        return StoreSetting::query()->firstOrCreate([], [
            'store_name' => 'Maison Verde',
            'phone' => '+212600000000',
            'currency' => 'EUR',
            'timezone' => 'Africa/Casablanca',
            'pickup_buffer_minutes' => 30,
        ]);
    }
}
