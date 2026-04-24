<?php

namespace App\Services\Documents;

use App\Enums\DocumentType;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Services\Orders\OrderFinancialContext;

class DocumentTypeResolver
{
    public function resolve(PaymentStatus $paymentStatus): DocumentType
    {
        return $paymentStatus === PaymentStatus::Paid
            ? DocumentType::Invoice
            : DocumentType::OrderVoucher;
    }

    public function resolvePaymentStatus(array $data, OrderFinancialContext $context, ?Order $order = null): PaymentStatus
    {
        if ($context === OrderFinancialContext::PublicCheckout) {
            return PaymentStatus::Pending;
        }

        if ($this->paymentWasConfirmed($data, $order)) {
            return PaymentStatus::Paid;
        }

        return PaymentStatus::Pending;
    }

    private function paymentWasConfirmed(array $data, ?Order $order): bool
    {
        if (array_key_exists('payment_captured', $data)) {
            return (bool) $data['payment_captured'];
        }

        if ((bool) ($data['is_paid'] ?? false)) {
            return true;
        }

        if (! empty($data['payment_status'])) {
            $status = $data['payment_status'] instanceof PaymentStatus
                ? $data['payment_status']
                : PaymentStatus::from((string) $data['payment_status']);

            return $status === PaymentStatus::Paid;
        }

        return (bool) ($order?->is_paid ?? false);
    }
}
