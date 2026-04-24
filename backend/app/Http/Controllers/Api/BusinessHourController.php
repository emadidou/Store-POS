<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BusinessHourResource;
use App\Models\BusinessHour;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BusinessHourController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return BusinessHourResource::collection(
            BusinessHour::query()->orderBy('day_of_week')->get()
        );
    }
}
