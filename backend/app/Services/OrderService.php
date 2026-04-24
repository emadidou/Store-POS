<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Customer;
use App\Models\Order;
use App\Models\PickupSlot;
use App\Models\Product;
use App\Services\Documents\DocumentTypeResolver;
use App\Services\Documents\InvoiceNumberGenerator;
use App\Services\Orders\OrderFinancialContext;
use App\Services\Tax\TaxCalculator;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function __construct(
        private readonly StoreStatusService $storeStatusService,
        private readonly StockService $stockService,
        private readonly TaxCalculator $taxCalculator,
        private readonly DocumentTypeResolver $documentTypeResolver,
        private readonly InvoiceNumberGenerator $invoiceNumberGenerator,
    )
    {
    }

    public function createPublic(array $data): Order
    {
        return $this->create(
            $this->sanitizePublicPayload($data),
            true,
            OrderFinancialContext::PublicCheckout,
        );
    }

    public function createAdmin(array $data, bool $enforceStoreAvailability = false): Order
    {
        return $this->create(
            $this->sanitizeAdminPayload($data),
            $enforceStoreAvailability,
            OrderFinancialContext::Admin,
        );
    }

    public function updateAdmin(Order $order, array $data): Order
    {
        if (($order->document_type?->value ?? $order->document_type) === 'credit_note') {
            throw ValidationException::withMessages([
                'order' => ['Un avoir est immutable et ne peut pas etre modifie.'],
            ]);
        }

        if ($order->invoice_number) {
            throw ValidationException::withMessages([
                'order' => ['Cette commande a deja une facture generee et ne peut plus etre modifiee.'],
            ]);
        }

        if ($order->status === OrderStatus::Cancelled) {
            throw ValidationException::withMessages([
                'order' => ['Une commande annulee ne peut pas etre modifiee.'],
            ]);
        }

        $data = $this->sanitizeAdminPayload($data, $order);

        return DB::transaction(function () use ($order, $data): Order {
            $customer = Customer::query()->updateOrCreate(
                ['phone' => $data['phone']],
                [
                    'full_name' => $data['full_name'],
                    'email' => $data['email'] ?? null,
                ],
            );

            $this->restoreStock($order);
            $order->items()->delete();
            [$orderLines, $totals, $taxContext] = $this->prepareOrderLines($data['items'], $data['source'] ?? $order->source ?? 'admin');
            $paymentStatus = $this->resolvePaymentStatus($data, OrderFinancialContext::Admin, $order);
            $documentData = $this->buildCommercialDocumentData($paymentStatus, $order);

            $order->update([
                'customer_id' => $customer->id,
                'status' => $data['status'],
                ...$totals,
                'vat_rate' => $taxContext['vat_rate'],
                'vat_regime' => $taxContext['vat_regime'],
                'legal_note' => $taxContext['legal_note'],
                'pickup_date' => $data['pickup_date'],
                'pickup_time' => $data['pickup_time'],
                'payment_method' => $data['payment_method'],
                'notes' => $data['notes'] ?? null,
                'source' => $data['source'] ?? $order->source,
                'order_type' => $data['order_type'] ?? $order->order_type,
                'is_paid' => $paymentStatus === PaymentStatus::Paid,
                'payment_status' => $paymentStatus->value,
                'stock_restored_at' => null,
                ...$documentData,
            ]);

            $order->items()->createMany($orderLines);

            return $order->refresh()->load(['customer', 'items.product.category']);
        });
    }

    public function updateStatus(Order $order, OrderStatus|string $status): Order
    {
        if (($order->document_type?->value ?? $order->document_type) === 'credit_note') {
            throw ValidationException::withMessages([
                'status' => ['Le statut dun avoir ne peut pas etre modifie.'],
            ]);
        }

        $status = $status instanceof OrderStatus ? $status : OrderStatus::from((string) $status);

        if ($status === OrderStatus::Cancelled) {
            return $this->cancelOrder($order);
        }

        $currentStatus = $order->status instanceof OrderStatus ? $order->status : OrderStatus::from((string) $order->status);

        if ($currentStatus === OrderStatus::Cancelled) {
            throw ValidationException::withMessages([
                'status' => ['Une commande annulee ne peut pas revenir dans le flux actif.'],
            ]);
        }

        if ($currentStatus === OrderStatus::PickedUp && $status !== OrderStatus::PickedUp) {
            throw ValidationException::withMessages([
                'status' => ['Une commande deja recuperee ne peut plus changer de statut.'],
            ]);
        }

        $order->update(['status' => $status]);

        return $order->refresh()->load(['customer', 'items.product.category']);
    }

    public function cancelOrder(Order $order): Order
    {
        $documentType = $order->document_type?->value ?? $order->document_type;
        $paymentStatus = $order->payment_status?->value ?? $order->payment_status;

        if ($documentType === 'credit_note') {
            throw ValidationException::withMessages([
                'status' => ['Un avoir ne peut pas etre annule.'],
            ]);
        }

        if ($documentType === 'invoice' && $paymentStatus === PaymentStatus::Paid->value) {
            throw ValidationException::withMessages([
                'status' => ['Une facture payee doit etre annulee via la creation dun avoir.'],
            ]);
        }

        $currentStatus = $order->status instanceof OrderStatus ? $order->status : OrderStatus::from((string) $order->status);

        if ($currentStatus === OrderStatus::PickedUp) {
            throw ValidationException::withMessages([
                'status' => ['Une commande deja recuperee ne peut pas etre annulee.'],
            ]);
        }

        if ($currentStatus === OrderStatus::Cancelled) {
            return $order->refresh()->load(['customer', 'items.product.category']);
        }

        return DB::transaction(function () use ($order): Order {
            $this->restoreStock($order);

            $order->update([
                'status' => OrderStatus::Cancelled,
                'cancelled_at' => now(),
            ]);

            return $order->refresh()->load(['customer', 'items.product.category']);
        });
    }

    private function create(array $data, bool $enforceStoreAvailability, OrderFinancialContext $context): Order
    {
        if ($enforceStoreAvailability && ! $this->storeStatusService->isOpenNow()) {
            throw ValidationException::withMessages([
                'store' => ['Le magasin est ferme. Les commandes ne sont pas disponibles pour le moment.'],
            ]);
        }

        if ($enforceStoreAvailability) {
            $this->assertPickupSlotAvailable($data['pickup_date'], $data['pickup_time']);
        }

        return DB::transaction(function () use ($data, $context): Order {
            $taxContext = $this->taxCalculator->taxContext($this->storeStatusService->settings());
            $items = collect($data['items'])
                ->groupBy('product_id')
                ->map(fn ($rows) => (float) $rows->sum('quantity'));

            $products = Product::query()
                ->whereIn('id', $items->keys())
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $orderLines = [];
            $total = 0.0;

            foreach ($items as $productId => $quantity) {
                $product = $products->get((int) $productId);

                if (! $product) {
                    throw ValidationException::withMessages([
                        'items' => ["Le produit #{$productId} est introuvable."],
                    ]);
                }

                if (! $product->is_available) {
                    throw ValidationException::withMessages([
                        'items' => ["{$product->name} est indisponible."],
                    ]);
                }

                if ((float) $product->stock < $quantity) {
                    throw ValidationException::withMessages([
                        'items' => ["Stock insuffisant pour {$product->name}."],
                    ]);
                }

                $taxLine = $this->taxCalculator->lineFromTtc((float) $product->price, $quantity, (float) $taxContext['vat_rate']);
                $total += $taxLine['subtotal_ttc'];

                $orderLines[] = [
                    'product_id' => $product->id,
                    'product_name_snapshot' => $product->name,
                    'quantity' => $quantity,
                    ...$taxLine,
                ];

                $this->stockService->decrease(
                    $product,
                    $quantity,
                    'Commande client',
                    $data['source'] ?? 'web',
                    "Sortie de stock pour {$product->name}",
                );
            }

            $customer = Customer::query()->updateOrCreate(
                ['phone' => $data['phone'] ?? 'POS-CAISSE'],
                [
                    'full_name' => $data['full_name'] ?? 'Client caisse',
                    'email' => $data['email'] ?? null,
                ],
            );

            $paymentStatus = $this->resolvePaymentStatus($data, $context);
            $documentData = $this->buildCommercialDocumentData($paymentStatus);
            $totals = $this->taxCalculator->totals($orderLines);

            $order = Order::query()->create([
                'customer_id' => $customer->id,
                'order_number' => $this->generateOrderNumber(),
                'voucher_token' => $this->generateVoucherToken(),
                'status' => $data['status'] ?? OrderStatus::Pending,
                ...$totals,
                'vat_rate' => $taxContext['vat_rate'],
                'vat_regime' => $taxContext['vat_regime'],
                'legal_note' => $taxContext['legal_note'],
                'pickup_date' => $data['pickup_date'],
                'pickup_time' => $data['pickup_time'],
                'payment_method' => $data['payment_method'],
                'notes' => $data['notes'] ?? null,
                'source' => $data['source'] ?? 'web',
                'order_type' => $data['order_type'] ?? 'pickup',
                'is_paid' => $paymentStatus === PaymentStatus::Paid,
                'payment_status' => $paymentStatus->value,
                ...$documentData,
            ]);

            $order->items()->createMany($orderLines);

            return $order->load(['customer', 'items.product.category']);
        });
    }

    public function delete(Order $order): void
    {
        if (($order->document_type?->value ?? $order->document_type) === 'credit_note') {
            throw ValidationException::withMessages([
                'order' => ['Un avoir ne peut pas etre supprime.'],
            ]);
        }

        if ($order->invoice_number) {
            throw ValidationException::withMessages([
                'order' => ['Une facture generee ne peut pas etre supprimee.'],
            ]);
        }

        DB::transaction(function () use ($order): void {
            $this->restoreStock($order);
            $order->delete();
        });
    }

    private function assertPickupSlotAvailable(string $pickupDate, string $pickupTime): void
    {
        $setting = $this->storeStatusService->settings();
        $pickupAt = CarbonImmutable::createFromFormat('Y-m-d H:i', "{$pickupDate} {$pickupTime}", $setting->timezone);
        $minimumPickupAt = CarbonImmutable::now($setting->timezone)->addMinutes($setting->pickup_buffer_minutes);

        if ($pickupAt->lessThan($minimumPickupAt)) {
            throw ValidationException::withMessages([
                'pickup_time' => ['Le creneau choisi est trop proche. Merci de choisir un horaire plus tardif.'],
            ]);
        }

        $slot = PickupSlot::query()
            ->active()
            ->where('day_of_week', $pickupAt->dayOfWeek)
            ->where('start_time', '<=', $pickupTime)
            ->where('end_time', '>', $pickupTime)
            ->first();

        if (! $slot) {
            throw ValidationException::withMessages([
                'pickup_time' => ['Le creneau de retrait choisi est indisponible.'],
            ]);
        }

        if ($slot->max_orders !== null) {
            $ordersCount = Order::query()
                ->whereDate('pickup_date', $pickupDate)
                ->where('pickup_time', $pickupTime)
                ->whereNot('status', OrderStatus::Cancelled->value)
                ->count();

            if ($ordersCount >= $slot->max_orders) {
                throw ValidationException::withMessages([
                    'pickup_time' => ['Ce creneau est complet.'],
                ]);
            }
        }
    }

    private function prepareOrderLines(array $rawItems, string $source = 'admin'): array
    {
        $taxContext = $this->taxCalculator->taxContext($this->storeStatusService->settings());
        $items = collect($rawItems)
            ->groupBy('product_id')
            ->map(fn ($rows) => (float) $rows->sum('quantity'));

        $products = Product::query()
            ->whereIn('id', $items->keys())
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        $orderLines = [];

        foreach ($items as $productId => $quantity) {
            $product = $products->get((int) $productId);

            if (! $product) {
                throw ValidationException::withMessages([
                    'items' => ["Le produit #{$productId} est introuvable."],
                ]);
            }

            if (! $product->is_available) {
                throw ValidationException::withMessages([
                    'items' => ["{$product->name} est indisponible."],
                ]);
            }

            if ((float) $product->stock < $quantity) {
                throw ValidationException::withMessages([
                    'items' => ["Stock insuffisant pour {$product->name}."],
                ]);
            }

            $taxLine = $this->taxCalculator->lineFromTtc((float) $product->price, $quantity, (float) $taxContext['vat_rate']);

            $orderLines[] = [
                'product_id' => $product->id,
                'product_name_snapshot' => $product->name,
                'quantity' => $quantity,
                ...$taxLine,
            ];

            $this->stockService->decrease(
                $product,
                $quantity,
                'Mise a jour commande',
                $source,
                "Sortie de stock pour {$product->name}",
            );
        }

        return [$orderLines, $this->taxCalculator->totals($orderLines), $taxContext];
    }

    private function restoreStock(Order $order): void
    {
        if ($order->stock_restored_at) {
            return;
        }

        $order->loadMissing('items.product');

        foreach ($order->items as $item) {
            if ($item->product) {
                $this->stockService->increase(
                    $item->product,
                    (float) $item->quantity,
                    'Annulation ou correction commande',
                    $order->source ?? 'order',
                    "Retour stock pour {$item->product_name_snapshot}",
                );
            }
        }

        $order->forceFill(['stock_restored_at' => now()])->save();
    }

    private function generateOrderNumber(): string
    {
        do {
            $orderNumber = 'MV-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
        } while (Order::query()->where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }

    private function generateVoucherToken(): string
    {
        do {
            $token = Str::random(48);
        } while (Order::query()->where('voucher_token', $token)->exists());

        return $token;
    }

    private function resolvePaymentStatus(array $data, OrderFinancialContext $context, ?Order $order = null): PaymentStatus
    {
        return $this->documentTypeResolver->resolvePaymentStatus($data, $context, $order);
    }

    private function buildCommercialDocumentData(PaymentStatus $paymentStatus, ?Order $order = null): array
    {
        if ($paymentStatus !== PaymentStatus::Paid) {
            return [
                'document_type' => $this->documentTypeResolver->resolve($paymentStatus)->value,
                'invoice_number' => null,
                'paid_at' => null,
            ];
        }

        return [
            'document_type' => $this->documentTypeResolver->resolve($paymentStatus)->value,
            'invoice_number' => $order?->invoice_number ?: $this->invoiceNumberGenerator->generate(),
            'paid_at' => $order?->paid_at ?: now(),
        ];
    }

    private function sanitizePublicPayload(array $data): array
    {
        return [
            'full_name' => $data['full_name'],
            'phone' => $data['phone'],
            'email' => $data['email'] ?? null,
            'pickup_date' => $data['pickup_date'],
            'pickup_time' => $data['pickup_time'],
            'payment_method' => $data['payment_method'],
            'notes' => $data['notes'] ?? null,
            'source' => 'web',
            'order_type' => 'pickup',
            'status' => OrderStatus::Pending,
            'payment_captured' => false,
            'items' => $data['items'],
        ];
    }

    private function sanitizeAdminPayload(array $data, ?Order $order = null): array
    {
        $source = $data['source'] ?? $order?->source ?? 'admin';
        $paymentMethod = $data['payment_method'];
        $paymentCaptured = array_key_exists('payment_captured', $data)
            ? (bool) $data['payment_captured']
            : (
                array_key_exists('payment_status', $data)
                ? (($data['payment_status'] instanceof PaymentStatus ? $data['payment_status'] : PaymentStatus::from((string) $data['payment_status'])) === PaymentStatus::Paid)
                : (bool) ($data['is_paid'] ?? false)
            );

        return [
            'full_name' => $data['full_name'] ?? 'Client caisse',
            'phone' => $data['phone'] ?? 'POS-CAISSE',
            'email' => $data['email'] ?? null,
            'pickup_date' => $data['pickup_date'],
            'pickup_time' => $data['pickup_time'],
            'payment_method' => $paymentMethod,
            'status' => $data['status'] ?? OrderStatus::Pending,
            'notes' => $data['notes'] ?? null,
            'source' => $source,
            'order_type' => $data['order_type'] ?? $order?->order_type ?? 'pickup',
            'payment_captured' => $paymentCaptured,
            'items' => $data['items'],
        ];
    }
}
