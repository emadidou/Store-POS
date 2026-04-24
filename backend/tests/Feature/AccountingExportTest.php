<?php

namespace Tests\Feature;

use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\BuildsStoreFixtures;
use Tests\TestCase;

class AccountingExportTest extends TestCase
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

    public function test_accounting_export_supports_day_month_year_and_all_and_includes_credit_notes_without_vouchers(): void
    {
        $product = $this->createStoreFixture(['stock' => 20]);
        Sanctum::actingAs($this->createAdminUser());

        $paidInvoice = $this->postJson('/api/admin/orders', $this->adminOrderPayload($product, [
            'payment_method' => 'cash',
            'payment_captured' => true,
        ]));
        $paidInvoice->assertCreated();

        $creditNote = $this->postJson("/api/admin/orders/{$paidInvoice->json('data.id')}/credit-note", $this->creditNotePayload($product));
        $creditNote->assertCreated();

        $this->postJson('/api/admin/orders', $this->adminOrderPayload($product, [
            'payment_method' => 'stripe_later_ready',
            'payment_captured' => false,
            'status' => 'pending',
            'phone' => 'POS-ATTENTE',
        ]))->assertCreated();

        $invoiceNumber = $paidInvoice->json('data.invoice_number');
        $date = CarbonImmutable::now('Africa/Casablanca')->format('Y-m-d');
        $month = CarbonImmutable::now('Africa/Casablanca')->format('Y-m');
        $year = CarbonImmutable::now('Africa/Casablanca')->format('Y');

        foreach ([
            "/api/admin/accounting-export?type=day&date={$date}",
            "/api/admin/accounting-export?type=month&month={$month}",
            "/api/admin/accounting-export?type=year&year={$year}",
            '/api/admin/accounting-export?type=all',
        ] as $path) {
            $response = $this->get($path);
            $response->assertOk();

            $content = $response->streamedContent();
            $this->assertStringContainsString($invoiceNumber, $content);
            $this->assertStringContainsString($creditNote->json('data.credit_note_number'), $content);
            $this->assertStringNotContainsString('order_voucher', $content);
        }
    }
}
