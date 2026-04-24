<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PickupSlotResource;
use App\Models\PickupSlot;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PickupSlotController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return PickupSlotResource::collection(
            PickupSlot::query()->active()->orderBy('day_of_week')->orderBy('start_time')->get()
        );
    }
}
