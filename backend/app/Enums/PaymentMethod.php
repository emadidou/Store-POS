<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case Cash = 'cash';
    case StripeLaterReady = 'stripe_later_ready';
    case Stripe = 'stripe';
}
