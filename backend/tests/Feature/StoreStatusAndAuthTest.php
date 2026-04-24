<?php

namespace Tests\Feature;

use App\Models\BusinessHour;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Concerns\BuildsStoreFixtures;
use Tests\TestCase;

class StoreStatusAndAuthTest extends TestCase
{
    use BuildsStoreFixtures;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow(CarbonImmutable::create(2026, 4, 24, 10, 0, 0, 'Africa/Casablanca'));
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_store_status_uses_configured_messages(): void
    {
        $this->createStoreFixture();

        $this->getJson('/api/store-status')
            ->assertOk()
            ->assertJsonPath('data.message', 'Commandes ouvertes');

        BusinessHour::query()->where('day_of_week', CarbonImmutable::now('Africa/Casablanca')->dayOfWeek)->update([
            'is_closed' => true,
            'open_time' => null,
            'close_time' => null,
        ]);

        $this->getJson('/api/store-status')
            ->assertOk()
            ->assertJsonPath('data.message', 'Boutique fermee');
    }

    public function test_admin_login_is_throttled_after_repeated_failures(): void
    {
        $admin = $this->createAdminUser();

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/admin/login', [
                'email' => $admin->email,
                'password' => 'wrong-password',
                'device_name' => 'tests',
            ])->assertStatus(401);
        }

        $this->postJson('/api/admin/login', [
            'email' => $admin->email,
            'password' => 'wrong-password',
            'device_name' => 'tests',
        ])->assertStatus(429);
    }
}
