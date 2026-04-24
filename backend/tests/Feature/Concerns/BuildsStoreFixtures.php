<?php

namespace Tests\Feature\Concerns;

use App\Models\BusinessHour;
use App\Models\Category;
use App\Models\PickupSlot;
use App\Models\Product;
use App\Models\StoreSetting;
use App\Models\User;
use Carbon\CarbonImmutable;

trait BuildsStoreFixtures
{
    protected function createStoreFixture(array $productOverrides = []): Product
    {
        StoreSetting::query()->create([
            'store_name' => 'Maison Verde',
            'company_name' => 'Maison Verde',
            'phone' => '+33123456789',
            'email' => 'contact@example.test',
            'address' => '1 rue du test',
            'currency' => 'EUR',
            'timezone' => 'Africa/Casablanca',
            'pickup_buffer_minutes' => 30,
            'vat_rate' => 5.50,
            'default_vat_rate' => 5.50,
            'vat_exempt' => false,
            'vat_regime' => 'standard',
            'open_message' => 'Commandes ouvertes',
            'closed_message' => 'Boutique fermee',
        ]);

        foreach (range(0, 6) as $dayOfWeek) {
            BusinessHour::query()->create([
                'day_of_week' => $dayOfWeek,
                'open_time' => '00:00',
                'close_time' => '23:59',
                'is_closed' => false,
            ]);

            PickupSlot::query()->create([
                'day_of_week' => $dayOfWeek,
                'start_time' => '00:00',
                'end_time' => '23:59',
                'max_orders' => 50,
                'is_active' => true,
            ]);
        }

        $category = Category::query()->create([
            'name' => 'Fruits',
            'slug' => 'fruits',
            'description' => 'Fruits frais',
            'is_active' => true,
        ]);

        return Product::query()->create([
            'category_id' => $category->id,
            'name' => 'Pommes',
            'slug' => 'pommes',
            'description' => 'Pommes fraiches',
            'price' => 10.00,
            'stock' => 10,
            'alert_threshold' => 3,
            'is_available' => true,
            'is_featured' => false,
            ...$productOverrides,
        ]);
    }

    protected function createAdminUser(): User
    {
        return User::factory()->create([
            'is_admin' => true,
        ]);
    }

    protected function publicOrderPayload(Product $product, array $overrides = []): array
    {
        $pickupAt = CarbonImmutable::now('Africa/Casablanca')->addMinutes(90);

        return [
            'customer' => [
                'full_name' => 'Alice Martin',
                'phone' => '+33612345678',
                'email' => 'alice@example.test',
            ],
            'full_name' => 'Alice Martin',
            'phone' => '+33612345678',
            'email' => 'alice@example.test',
            'pickup_date' => $pickupAt->format('Y-m-d'),
            'pickup_time' => $pickupAt->format('H:i'),
            'payment_method' => 'cash',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
            ...$overrides,
        ];
    }

    protected function adminOrderPayload(Product $product, array $overrides = []): array
    {
        $pickupAt = CarbonImmutable::now('Africa/Casablanca')->addMinutes(30);

        return [
            'customer' => [
                'full_name' => 'Client POS',
                'phone' => 'POS-CAISSE',
                'email' => null,
            ],
            'full_name' => 'Client POS',
            'phone' => 'POS-CAISSE',
            'email' => null,
            'pickup_date' => $pickupAt->format('Y-m-d'),
            'pickup_time' => $pickupAt->format('H:i'),
            'payment_method' => 'cash',
            'status' => 'confirmed',
            'source' => 'pos',
            'order_type' => 'in_store',
            'payment_captured' => true,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
            ...$overrides,
        ];
    }

    protected function creditNotePayload(Product $product, array $overrides = []): array
    {
        return [
            'reason' => 'Annulation client',
            'mode' => 'full',
            'restore_stock' => true,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
            ...$overrides,
        ];
    }
}
