<?php

namespace App\Services;

use App\Models\BusinessHour;
use App\Models\StoreSetting;
use Carbon\CarbonImmutable;

class StoreStatusService
{
    public function currentStatus(): array
    {
        $setting = $this->settings();
        $now = CarbonImmutable::now($setting->timezone);

        return $this->statusAt($now, $setting);
    }

    public function isOpenNow(): bool
    {
        return $this->currentStatus()['is_open'];
    }

    public function statusAt(CarbonImmutable $dateTime, ?StoreSetting $setting = null): array
    {
        $setting ??= $this->settings();
        $current = $dateTime->setTimezone($setting->timezone);
        $businessHour = BusinessHour::query()->where('day_of_week', $current->dayOfWeek)->first();

        if (! $businessHour || $businessHour->is_closed || ! $businessHour->open_time || ! $businessHour->close_time) {
            return $this->closedStatus($current, $setting, $setting->closed_message ?: 'Magasin ferme');
        }

        $opensAt = $this->timeOnDate($current, $businessHour->open_time);
        $closesAt = $this->timeOnDate($current, $businessHour->close_time);
        $isOpen = $current->greaterThanOrEqualTo($opensAt) && $current->lessThan($closesAt);

        if (! $isOpen) {
            return $this->closedStatus($current, $setting, $setting->closed_message ?: 'Commandes terminees');
        }

        return [
            'is_open' => true,
            'message' => $setting->open_message ?: 'Commandes en cours',
            'opens_at' => $opensAt->toIso8601String(),
            'closes_at' => $closesAt->toIso8601String(),
            'timezone' => $setting->timezone,
        ];
    }

    public function settings(): StoreSetting
    {
        return StoreSetting::query()->firstOrCreate([], [
            'store_name' => 'Maison Verde',
            'phone' => '+212600000000',
            'currency' => 'EUR',
            'timezone' => 'Africa/Casablanca',
            'pickup_buffer_minutes' => 30,
        ]);
    }

    private function closedStatus(CarbonImmutable $current, StoreSetting $setting, string $message): array
    {
        $nextOpen = $this->nextOpeningDate($current);

        return [
            'is_open' => false,
            'message' => $message,
            'opens_at' => $nextOpen?->toIso8601String(),
            'closes_at' => null,
            'timezone' => $setting->timezone,
        ];
    }

    private function nextOpeningDate(CarbonImmutable $from): ?CarbonImmutable
    {
        for ($dayOffset = 0; $dayOffset <= 7; $dayOffset++) {
            $candidate = $from->addDays($dayOffset);
            $businessHour = BusinessHour::query()->where('day_of_week', $candidate->dayOfWeek)->first();

            if (! $businessHour || $businessHour->is_closed || ! $businessHour->open_time) {
                continue;
            }

            $opensAt = $this->timeOnDate($candidate, $businessHour->open_time);

            if ($opensAt->greaterThan($from)) {
                return $opensAt;
            }
        }

        return null;
    }

    private function timeOnDate(CarbonImmutable $date, string $time): CarbonImmutable
    {
        [$hour, $minute] = array_map('intval', explode(':', substr($time, 0, 5)));

        return $date->setTime($hour, $minute);
    }
}
