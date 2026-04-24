<?php

namespace App\Exports;

use App\Services\Sales\SalesJournalService;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class AccountingExport implements FromArray, ShouldAutoSize, WithEvents, WithHeadings, WithTitle
{
    public function __construct(
        private readonly SalesJournalService $salesJournalService,
        private readonly array $filters,
    ) {
    }

    public function headings(): array
    {
        return ['Date', 'Facture', 'Avoir', 'Facture origine', 'Type', 'Commande', 'Client', 'Sens', 'Paiement', 'HT', 'TVA', 'TTC', 'Statut', 'Source'];
    }

    public function array(): array
    {
        $rows = [];

        $this->salesJournalService->query($this->filters)
            ->orderBy('created_at')
            ->with('customer')
            ->chunk(500, function ($orders) use (&$rows): void {
                foreach ($orders as $order) {
                    $row = $this->salesJournalService->row($order);

                    $rows[] = [
                        $row['date_document'],
                        $row['invoice_number'],
                        $row['credit_note_number'],
                        $row['original_invoice_number'],
                        $row['document_type'],
                        $row['order_number'],
                        $row['customer_name'],
                        $row['document_type'] === 'credit_note' ? 'credit' : 'debit',
                        $row['payment_method'],
                        $row['amount_ht'],
                        $row['amount_vat'],
                        $row['amount_ttc'],
                        $row['payment_status'],
                        $row['source'],
                    ];
                }
            });

        return $rows;
    }

    public function title(): string
    {
        return 'Export comptable';
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event): void {
                $sheet = $event->sheet->getDelegate();
                $highestRow = max(1, $sheet->getHighestRow());
                $highestColumn = $sheet->getHighestColumn();
                $range = "A1:{$highestColumn}{$highestRow}";

                $sheet->freezePane('A2');
                $sheet->setAutoFilter($range);

                $sheet->getStyle('A1:N1')->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => 'FFF8E8']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '123D2D']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);

                $sheet->getStyle($range)->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['rgb' => 'D8E0D4'],
                        ],
                    ],
                    'alignment' => [
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);

                for ($row = 2; $row <= $highestRow; $row++) {
                    if ($row % 2 === 0) {
                        $sheet->getStyle("A{$row}:N{$row}")->getFill()
                            ->setFillType(Fill::FILL_SOLID)
                            ->getStartColor()
                            ->setRGB('F7F3E9');
                    }
                }

                $sheet->getStyle("J2:L{$highestRow}")
                    ->getNumberFormat()
                    ->setFormatCode('#,##0.00');

                $sheet->getStyle("A2:A{$highestRow}")
                    ->getNumberFormat()
                    ->setFormatCode('dd/mm/yyyy');

                $sheet->getRowDimension(1)->setRowHeight(24);
            },
        ];
    }
}
