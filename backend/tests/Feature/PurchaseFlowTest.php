<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Purchase;
use App\Models\StockMovement;
use App\Models\Supplier;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuildsStoreFixtures;
use Tests\TestCase;

class PurchaseFlowTest extends TestCase
{
    use BuildsStoreFixtures;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow(CarbonImmutable::create(2026, 4, 24, 10, 0, 0, 'Africa/Casablanca'));
        Storage::fake('local');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_confirmed_purchase_increases_stock_and_creates_movements(): void
    {
        $product = $this->createStoreFixture(['stock' => 5]);
        $supplier = Supplier::query()->create(['name' => 'Prime Import']);
        Sanctum::actingAs($this->createAdminUser());

        $response = $this->postJson('/api/admin/purchases', [
            'supplier_id' => $supplier->id,
            'purchase_date' => '2026-04-24',
            'status' => 'confirmed',
            'payment_status' => 'paid',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 4,
                    'unit_cost_ht' => 3.50,
                    'vat_rate' => 20,
                ],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', 'confirmed');

        $purchase = Purchase::query()->firstOrFail();
        $this->assertSame(9.0, (float) Product::query()->findOrFail($product->id)->stock);
        $this->assertNotNull($purchase->stock_applied_at);
        $this->assertSame(1, StockMovement::query()->where('purchase_id', $purchase->id)->count());
    }

    public function test_draft_purchase_does_not_move_stock_until_confirmation(): void
    {
        $product = $this->createStoreFixture(['stock' => 5]);
        Sanctum::actingAs($this->createAdminUser());

        $create = $this->postJson('/api/admin/purchases', [
            'purchase_date' => '2026-04-24',
            'status' => 'draft',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                    'unit_cost_ht' => 2.00,
                    'vat_rate' => 20,
                ],
            ],
        ]);

        $create->assertCreated()
            ->assertJsonPath('data.status', 'draft');
        $purchaseId = $create->json('data.id');

        $this->assertSame(5.0, (float) Product::query()->findOrFail($product->id)->stock);

        $confirm = $this->patchJson("/api/admin/purchases/{$purchaseId}/status", ['status' => 'confirmed']);
        $confirm->assertOk()->assertJsonPath('data.status', 'confirmed');

        $this->assertSame(7.0, (float) Product::query()->findOrFail($product->id)->stock);
    }

    public function test_confirmed_purchase_can_be_cancelled_only_if_reverse_stock_is_possible(): void
    {
        $product = $this->createStoreFixture(['stock' => 1]);
        Sanctum::actingAs($this->createAdminUser());

        $create = $this->postJson('/api/admin/purchases', [
            'purchase_date' => '2026-04-24',
            'status' => 'confirmed',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                    'unit_cost_ht' => 1.50,
                    'vat_rate' => 20,
                ],
            ],
        ]);

        $purchaseId = $create->json('data.id');
        $this->assertSame(3.0, (float) Product::query()->findOrFail($product->id)->stock);

        Product::query()->findOrFail($product->id)->update(['stock' => 1]);

        $blocked = $this->patchJson("/api/admin/purchases/{$purchaseId}/status", ['status' => 'cancelled']);
        $blocked->assertStatus(422);

        Product::query()->findOrFail($product->id)->update(['stock' => 3]);

        $cancel = $this->patchJson("/api/admin/purchases/{$purchaseId}/status", ['status' => 'cancelled']);
        $cancel->assertOk()->assertJsonPath('data.status', 'cancelled');
        $this->assertSame(1.0, (float) Product::query()->findOrFail($product->id)->stock);
    }

    public function test_purchase_attachment_is_stored_and_downloadable_for_admin(): void
    {
        $product = $this->createStoreFixture();
        Sanctum::actingAs($this->createAdminUser());

        $response = $this->post('/api/admin/purchases', [
            'purchase_date' => '2026-04-24',
            'status' => 'draft',
            'attachment' => UploadedFile::fake()->create('facture-fournisseur.pdf', 120, 'application/pdf'),
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                    'unit_cost_ht' => 2,
                    'vat_rate' => 20,
                ],
            ],
        ], ['Accept' => 'application/json']);

        $response->assertCreated();
        $purchaseId = $response->json('data.id');
        $path = $response->json('data.attachment_path');
        Storage::disk('local')->assertExists($path);

        $download = $this->get("/api/admin/purchases/{$purchaseId}/attachment/download");
        $download->assertOk();
    }

    public function test_purchase_accounting_export_contains_confirmed_purchases(): void
    {
        $product = $this->createStoreFixture();
        $supplier = Supplier::query()->create(['name' => 'Green Supplier']);
        Sanctum::actingAs($this->createAdminUser());

        $this->postJson('/api/admin/purchases', [
            'supplier_id' => $supplier->id,
            'purchase_date' => '2026-04-24',
            'status' => 'confirmed',
            'external_invoice_number' => 'FS-7788',
            'payment_status' => 'paid',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 3,
                    'unit_cost_ht' => 4,
                    'vat_rate' => 20,
                ],
            ],
        ])->assertCreated();

        $response = $this->get('/api/admin/accounting-export/purchases?type=all');
        $response->assertOk();
        $content = $response->streamedContent();

        $this->assertStringContainsString('FS-7788', $content);
        $this->assertStringContainsString('Green Supplier', $content);
    }
}
