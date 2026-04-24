<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\StockMovement;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuildsStoreFixtures;
use Tests\TestCase;

class OrderFlowTest extends TestCase
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

    public function test_web_order_payment_at_reception_generates_pending_order_voucher(): void
    {
        $product = $this->createStoreFixture();

        $response = $this->postJson('/api/orders', $this->publicOrderPayload($product));

        $response->assertCreated()
            ->assertJsonPath('data.source', 'web')
            ->assertJsonPath('data.payment_status', 'pending')
            ->assertJsonPath('data.document_type', 'order_voucher')
            ->assertJsonPath('data.invoice_number', null);
    }

    public function test_public_checkout_ignores_sensitive_financial_fields(): void
    {
        $product = $this->createStoreFixture();

        $response = $this->postJson('/api/orders', $this->publicOrderPayload($product, [
            'source' => 'pos',
            'payment_status' => 'paid',
            'is_paid' => true,
            'document_type' => 'invoice',
        ]));

        $response->assertCreated()
            ->assertJsonPath('data.source', 'web')
            ->assertJsonPath('data.payment_status', 'pending')
            ->assertJsonPath('data.document_type', 'order_voucher');
    }

    public function test_pos_cash_generates_a_paid_invoice(): void
    {
        $product = $this->createStoreFixture();
        Sanctum::actingAs($this->createAdminUser());

        $response = $this->postJson('/api/admin/orders', $this->adminOrderPayload($product, [
            'payment_method' => 'cash',
            'payment_captured' => true,
        ]));

        $response->assertCreated()
            ->assertJsonPath('data.payment_status', 'paid')
            ->assertJsonPath('data.document_type', 'invoice');

        $this->assertNotNull($response->json('data.invoice_number'));
    }

    public function test_pos_card_tpe_generates_a_paid_invoice(): void
    {
        $product = $this->createStoreFixture();
        Sanctum::actingAs($this->createAdminUser());

        $response = $this->postJson('/api/admin/orders', $this->adminOrderPayload($product, [
            'payment_method' => 'stripe',
            'payment_captured' => true,
        ]));

        $response->assertCreated()
            ->assertJsonPath('data.payment_status', 'paid')
            ->assertJsonPath('data.document_type', 'invoice');
    }

    public function test_cancelling_an_unpaid_order_restores_stock(): void
    {
        $product = $this->createStoreFixture(['stock' => 8]);
        $orderResponse = $this->postJson('/api/orders', $this->publicOrderPayload($product));
        $orderId = $orderResponse->json('data.id');

        $this->assertSame(7.0, (float) Product::query()->findOrFail($product->id)->stock);

        Sanctum::actingAs($this->createAdminUser());
        $cancelResponse = $this->patchJson("/api/admin/orders/{$orderId}/status", ['status' => 'cancelled']);

        $cancelResponse->assertOk()
            ->assertJsonPath('data.status', 'cancelled');

        $this->assertSame(8.0, (float) Product::query()->findOrFail($product->id)->stock);
        $this->assertNotNull(Order::query()->findOrFail($orderId)->stock_restored_at);
        $this->assertGreaterThanOrEqual(2, StockMovement::query()->where('product_id', $product->id)->count());
    }

    public function test_cancelling_a_paid_invoice_requires_a_credit_note(): void
    {
        $product = $this->createStoreFixture(['stock' => 5]);
        Sanctum::actingAs($this->createAdminUser());

        $createResponse = $this->postJson('/api/admin/orders', $this->adminOrderPayload($product));
        $orderId = $createResponse->json('data.id');

        $cancelResponse = $this->patchJson("/api/admin/orders/{$orderId}/status", ['status' => 'cancelled']);
        $cancelResponse->assertStatus(422)
            ->assertJsonValidationErrors('status');
    }

    public function test_credit_note_creation_keeps_invoice_trace_and_restores_stock(): void
    {
        $product = $this->createStoreFixture(['stock' => 5]);
        Sanctum::actingAs($this->createAdminUser());

        $createResponse = $this->postJson('/api/admin/orders', $this->adminOrderPayload($product));
        $createResponse->assertCreated();
        $orderId = $createResponse->json('data.id');

        $this->assertSame(4.0, (float) Product::query()->findOrFail($product->id)->stock);

        $creditResponse = $this->postJson("/api/admin/orders/{$orderId}/credit-note", $this->creditNotePayload($product));
        $creditResponse->assertCreated()
            ->assertJsonPath('data.document_type', 'credit_note')
            ->assertJsonPath('data.original_order.id', $orderId);

        $this->assertNotNull($creditResponse->json('data.credit_note_number'));
        $this->assertSame(5.0, (float) Product::query()->findOrFail($product->id)->stock);

        $journalResponse = $this->getJson('/api/admin/sales-journal');
        $journalResponse->assertOk();
        $this->assertStringContainsString($createResponse->json('data.invoice_number'), $journalResponse->getContent());
        $this->assertStringContainsString($creditResponse->json('data.credit_note_number'), $journalResponse->getContent());
    }

    public function test_credit_note_pdf_is_available_for_admin(): void
    {
        $product = $this->createStoreFixture(['stock' => 5]);
        Sanctum::actingAs($this->createAdminUser());

        $createResponse = $this->postJson('/api/admin/orders', $this->adminOrderPayload($product));
        $creditResponse = $this->postJson("/api/admin/orders/{$createResponse->json('data.id')}/credit-note", $this->creditNotePayload($product));

        $pdfResponse = $this->get("/api/admin/credit-notes/{$creditResponse->json('data.id')}/pdf");
        $pdfResponse->assertOk();
        $pdfResponse->assertHeader('content-type', 'application/pdf');
    }

    public function test_out_of_stock_products_are_not_orderable(): void
    {
        $product = $this->createStoreFixture(['stock' => 0]);

        $response = $this->postJson('/api/orders', $this->publicOrderPayload($product));

        $response->assertStatus(422);
    }

    public function test_invoice_numbers_are_unique(): void
    {
        $product = $this->createStoreFixture(['stock' => 20]);
        Sanctum::actingAs($this->createAdminUser());

        $first = $this->postJson('/api/admin/orders', $this->adminOrderPayload($product, ['phone' => 'POS-001']));
        $second = $this->postJson('/api/admin/orders', $this->adminOrderPayload($product, ['phone' => 'POS-002']));

        $first->assertCreated();
        $second->assertCreated();

        $this->assertNotSame($first->json('data.invoice_number'), $second->json('data.invoice_number'));
    }
}
