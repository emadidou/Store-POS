<?php

namespace App\Enums;

enum DocumentType: string
{
    case Invoice = 'invoice';
    case OrderVoucher = 'order_voucher';
    case CreditNote = 'credit_note';
}
