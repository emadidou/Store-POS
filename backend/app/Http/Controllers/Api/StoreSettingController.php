<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StoreSettingResource;
use App\Services\StoreStatusService;

class StoreSettingController extends Controller
{
    public function show(StoreStatusService $storeStatusService): StoreSettingResource
    {
        return new StoreSettingResource($storeStatusService->settings());
    }
}
