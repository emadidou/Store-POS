<?php

namespace App\Services\Orders;

enum OrderFinancialContext: string
{
    case PublicCheckout = 'public_checkout';
    case Admin = 'admin';
}
