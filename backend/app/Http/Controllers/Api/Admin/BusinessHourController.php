<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateBusinessHoursRequest;
use App\Http\Resources\BusinessHourResource;
use App\Models\BusinessHour;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BusinessHourController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return BusinessHourResource::collection(BusinessHour::query()->orderBy('day_of_week')->get());
    }

    public function update(UpdateBusinessHoursRequest $request): AnonymousResourceCollection
    {
        foreach ($request->validated('hours') as $hour) {
            BusinessHour::query()->updateOrCreate(
                ['day_of_week' => $hour['day_of_week']],
                [
                    'open_time' => $hour['is_closed'] ? null : $hour['open_time'],
                    'close_time' => $hour['is_closed'] ? null : $hour['close_time'],
                    'is_closed' => $hour['is_closed'],
                ],
            );
        }

        return $this->index();
    }
}
