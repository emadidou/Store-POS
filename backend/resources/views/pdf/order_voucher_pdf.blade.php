<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Bon de commande {{ $order->order_number }}</title>
    @include('pdf._styles')
</head>
<body>
@php
    $company = $settings->company_name ?: $settings->store_name;
    $paymentMethod = $order->payment_method?->value ?? $order->payment_method;
    $paymentLabels = ['cash' => 'Paiement a la reception', 'stripe' => 'Carte bancaire', 'stripe_later_ready' => 'Paiement a la reception'];
    $currency = $settings->currency ?: 'EUR';
    $shareCapital = $settings->share_capital !== null ? number_format((float) $settings->share_capital, 2, ',', ' ').' '.$settings->currency : null;
    $rcsLabel = $settings->rc ? 'RCS'.($settings->rcs_city ? ' '.$settings->rcs_city : '').' : '.$settings->rc : null;
    $legalIdentifiers = array_filter([
        $settings->siren ? 'SIREN : '.$settings->siren : null,
        $settings->siret ? 'SIRET : '.$settings->siret : null,
        $settings->ape_code ? 'APE/NAF : '.$settings->ape_code : null,
        $rcsLabel,
        $settings->vat_number ? 'TVA intracommunautaire : '.$settings->vat_number : null,
        $settings->ice ? 'ICE : '.$settings->ice : null,
    ]);
@endphp
<main class="document">
    <header class="header">
        <div class="header-left">
            <h1 class="company-name">{{ $company }} {{ $settings->legal_form }}</h1>
            @if($shareCapital)<p>Capital social : {{ $shareCapital }}</p>@endif
            @if($settings->address)<p>{{ $settings->address }}</p>@endif
            <p>Tel : {{ $settings->phone }} @if($settings->email)- Email : {{ $settings->email }}@endif</p>
            @foreach($legalIdentifiers as $identifier)<p>{{ $identifier }}</p>@endforeach
        </div>
        <div class="header-right">
            <div class="document-title">Bon de commande</div>
            <p class="value">{{ $order->order_number }}</p>
            <p>Date : {{ optional($order->created_at)->format('d/m/Y') }}</p>
        </div>
    </header>

    <section class="grid">
        <div class="grid-cell">
            <p class="label">Client</p>
            <p class="value">{{ $order->customer?->full_name ?: 'Client caisse' }}</p>
            <p>{{ $order->customer?->phone }}</p>
            @if($order->customer?->email)<p>{{ $order->customer->email }}</p>@endif
        </div>
        <div class="grid-cell">
            <p class="label">Paiement / Retrait</p>
            <p class="value">{{ $paymentLabels[$paymentMethod] ?? $paymentMethod }}</p>
            <p>Retrait : {{ optional($order->pickup_date)->format('d/m/Y') }} a {{ substr((string) $order->pickup_time, 0, 5) }}</p>
        </div>
    </section>

    <table>
        <thead>
        <tr>
            <th>Produit</th>
            <th class="num">Qte</th>
            <th class="num">Prix unitaire</th>
            <th class="num">Sous-total</th>
        </tr>
        </thead>
        <tbody>
        @foreach($order->items as $item)
            <tr>
                <td>{{ $item->product_name_snapshot }}</td>
                <td class="num">{{ rtrim(rtrim(number_format((float) $item->quantity, 3, ',', ' '), '0'), ',') }}</td>
                <td class="num">{{ number_format((float) $item->unit_price_ttc, 2, ',', ' ') }} {{ $currency }}</td>
                <td class="num">{{ number_format((float) $item->subtotal_ttc, 2, ',', ' ') }} {{ $currency }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>

    <section class="totals">
        <div class="totals-row total-ttc"><span>Total estime</span><strong>{{ number_format((float) $order->total_ttc, 2, ',', ' ') }} {{ $currency }}</strong></div>
    </section>

    <section class="note">
        <strong>Ce document est un bon de commande, il ne constitue pas une facture.</strong><br>
        Paiement a la reception. La facture sera emise apres encaissement.
    </section>
</main>

<footer class="footer">
    <strong>{{ $company }} {{ $settings->legal_form }}</strong>
    @if($shareCapital) - Capital social : {{ $shareCapital }} @endif
    @if($settings->address) - {{ $settings->address }} @endif
    - Tel : {{ $settings->phone }}
    @if($settings->email) - Email : {{ $settings->email }} @endif
    @foreach($legalIdentifiers as $identifier) - {{ $identifier }} @endforeach
</footer>
</body>
</html>
