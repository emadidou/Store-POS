<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePickupSlotRequest;
use App\Http\Requests\UpdatePickupSlotRequest;
use App\Http\Resources\PickupSlotResource;
use App\Models\PickupSlot;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class PickupSlotController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return PickupSlotResource::collection(
            PickupSlot::query()->orderBy('day_of_week')->orderBy('start_time')->get()
        );
    }

    public function store(StorePickupSlotRequest $request): PickupSlotResource
    {
        return new PickupSlotResource(PickupSlot::query()->create($request->validated()));
    }

    public function update(UpdatePickupSlotRequest $request, PickupSlot $pickupSlot): PickupSlotResource
    {
        $pickupSlot->update($request->validated());

        return new PickupSlotResource($pickupSlot->refresh());
    }

    public function destroy(PickupSlot $pickupSlot): Response
    {
        $pickupSlot->delete();

        return response()->noContent();
    }
}
