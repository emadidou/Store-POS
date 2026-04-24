<?php

namespace App\Services\Pdf;

use App\Enums\DocumentType;
use App\Enums\PaymentStatus;
use App\Models\DocumentGenerationLog;
use App\Models\Order;
use App\Models\StoreSetting;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

class DocumentPdfService
{
    public function stream(Order $order, StoreSetting $settings, ?string $forcedType = null): Response
    {
        $orderDocumentType = $order->document_type?->value ?? $order->document_type;
        $orderPaymentStatus = $order->payment_status?->value ?? $order->payment_status;
        $isPaid = $orderPaymentStatus === PaymentStatus::Paid->value || (bool) $order->is_paid || (bool) $order->invoice_number;
        $type = $forcedType ?: ($orderDocumentType === DocumentType::CreditNote->value
            ? DocumentType::CreditNote->value
            : ($isPaid ? DocumentType::Invoice->value : ($orderDocumentType ?: DocumentType::OrderVoucher->value)));

        if ($type === DocumentType::Invoice->value && ! $order->invoice_number) {
            throw new HttpException(422, 'La facture ne peut pas etre generee sans numero de facture.');
        }

        if ($type === DocumentType::Invoice->value && ! $isPaid) {
            throw new HttpException(422, 'Cette commande nest pas une facture.');
        }

        if ($type === DocumentType::OrderVoucher->value && ($isPaid || $orderDocumentType === DocumentType::Invoice->value)) {
            throw new HttpException(422, 'Cette commande est deja payee et doit etre imprimee en facture.');
        }

        if ($type === DocumentType::CreditNote->value && ! $order->credit_note_number) {
            throw new HttpException(422, 'Lavoir ne peut pas etre genere sans numero davoir.');
        }

        $view = match ($type) {
            DocumentType::Invoice->value => 'pdf.invoice_pdf',
            DocumentType::CreditNote->value => 'pdf.credit_note_pdf',
            default => 'pdf.order_voucher_pdf',
        };
        $filename = $this->filename($order, $type);
        $pdf = Pdf::loadView($view, [
            'order' => $order->loadMissing(['customer', 'items.product.category', 'originalOrder.customer']),
            'settings' => $settings,
            'type' => $type,
        ])->setPaper('a4');

        $this->logGeneration($order, $type, $filename);

        return $pdf->stream($filename);
    }

    public function filename(Order $order, string $type): string
    {
        $reference = match ($type) {
            DocumentType::Invoice->value => ($order->invoice_number ?: $order->order_number),
            DocumentType::CreditNote->value => ($order->credit_note_number ?: $order->order_number),
            default => $order->order_number,
        };

        $safeName = preg_replace('/[\/\\\\\s]+/', '-', strtolower("{$type}-{$reference}"));

        return "{$safeName}.pdf";
    }

    private function logGeneration(Order $order, string $type, string $filename): void
    {
        DocumentGenerationLog::query()->create([
            'order_id' => $order->id,
            'document_type' => $type,
            'invoice_number' => $order->invoice_number ?? $order->credit_note_number,
            'filename' => $filename,
            'generated_by' => auth()->user()?->email,
            'ip_address' => request()?->ip(),
        ]);
    }
}
