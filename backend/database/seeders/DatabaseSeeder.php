<?php

namespace Database\Seeders;

use App\Models\BusinessHour;
use App\Models\Category;
use App\Models\PickupSlot;
use App\Models\Product;
use App\Models\StoreSetting;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $fruits = Category::query()->updateOrCreate(
            ['slug' => 'fruits'],
            ['name' => 'Fruits', 'description' => 'Fruits frais de saison', 'is_active' => true],
        );

        $vegetables = Category::query()->updateOrCreate(
            ['slug' => 'legumes'],
            ['name' => 'Legumes', 'description' => 'Legumes frais pour vos repas', 'is_active' => true],
        );

        $baskets = Category::query()->updateOrCreate(
            ['slug' => 'paniers'],
            ['name' => 'Paniers', 'description' => 'Paniers prepares en boutique', 'is_active' => true],
        );

        $products = [
            [$fruits->id, 'Pommes Golden', 'pommes-golden', 'Pommes croquantes et sucrees.', 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&w=900&q=80', 24.90, 120, true],
            [$fruits->id, 'Bananes', 'bananes', 'Bananes mures a point.', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=900&q=80', 18.50, 90, true],
            [$vegetables->id, 'Tomates rondes', 'tomates-rondes', 'Tomates fraiches pour salades et sauces.', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=900&q=80', 16.00, 80, true],
            [$vegetables->id, 'Courgettes', 'courgettes', 'Courgettes locales selectionnees.', 'https://images.unsplash.com/photo-1598511726623-d2e9996892f0?auto=format&fit=crop&w=900&q=80', 14.00, 70, false],
            [$baskets->id, 'Panier primeur', 'panier-primeur', 'Assortiment de fruits et legumes de saison.', 'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?auto=format&fit=crop&w=900&q=80', 99.00, 25, true],
        ];

        foreach ($products as [$categoryId, $name, $slug, $description, $image, $price, $stock, $featured]) {
            $product = Product::query()->firstOrNew(['slug' => $slug]);
            $product->fill([
                'category_id' => $categoryId,
                'name' => $name,
                'description' => $description,
                'price' => $price,
                'stock' => $stock,
                'is_available' => true,
                'is_featured' => $featured,
            ]);

            if (! $product->image) {
                $product->image = $image;
            }

            $product->save();
        }

        for ($day = 0; $day <= 6; $day++) {
            BusinessHour::query()->updateOrCreate(
                ['day_of_week' => $day],
                [
                    'open_time' => $day === 0 ? null : '09:00',
                    'close_time' => $day === 0 ? null : '20:00',
                    'is_closed' => $day === 0,
                ],
            );
        }

        for ($day = 1; $day <= 6; $day++) {
            foreach ([['09:30', '12:30'], ['15:00', '19:30']] as [$start, $end]) {
                PickupSlot::query()->updateOrCreate(
                    ['day_of_week' => $day, 'start_time' => $start, 'end_time' => $end],
                    ['max_orders' => 8, 'is_active' => true],
                );
            }
        }

        StoreSetting::query()->firstOrCreate([], [
            'store_name' => 'Maison Verde',
            'company_name' => 'MAISON VERDE',
            'legal_form' => 'SARL',
            'share_capital' => 10000,
            'phone' => '+212600000000',
            'email' => 'contact@maison-verde.test',
            'address' => 'Adresse du magasin',
            'siren' => '000000000',
            'siret' => '00000000000000',
            'ape_code' => '4721Z',
            'rc' => '000 000 000',
            'rcs_city' => 'Paris',
            'vat_rate' => 5.50,
            'vat_exempt' => false,
            'vat_regime' => 'standard',
            'default_vat_rate' => 5.50,
            'legal_vat_note' => null,
            'pickup_buffer_minutes' => 30,
            'currency' => 'EUR',
            'timezone' => 'Africa/Casablanca',
            'open_message' => 'Commandes en cours',
            'closed_message' => 'Magasin ferme',
        ]);

        if (app()->environment('local')) {
            $adminEmail = env('SEED_ADMIN_EMAIL', 'admin@maison-verde.test');
            $adminPassword = env('SEED_ADMIN_PASSWORD', 'password');
            $adminName = env('SEED_ADMIN_NAME', 'Admin Maison Verde');

            User::query()->updateOrCreate([
                'email' => $adminEmail,
            ], [
                'name' => $adminName,
                'password' => Hash::make($adminPassword),
                'is_admin' => true,
            ]);
        }
    }
}
