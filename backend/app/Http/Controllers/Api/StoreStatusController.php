<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StoreStatusResource;
use App\Services\StoreStatusService;

class StoreStatusController extends Controller
{
    public function __invoke(StoreStatusService $storeStatusService): StoreStatusResource
    {
        return new StoreStatusResource($storeStatusService->currentStatus());
    }
}
