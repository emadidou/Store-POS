<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Avoir {{ $order->credit_note_number }}</title>
    @include('pdf._styles')
</head>
<body>
@php
    $company = $settings->company_name ?: $settings->store_name;
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
    $originalInvoice = $order->originalOrder?->invoice_number ?: '-';
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
            <div class="document-title">Avoir</div>
            <p class="value">{{ $order->credit_note_number }}</p>
            <p>Date avoir : {{ optional($order->refunded_at ?? $order->created_at)->format('d/m/Y') }}</p>
            <p>Facture origine : {{ $originalInvoice }}</p>
            <p>Commande origine : {{ $order->originalOrder?->order_number ?: '-' }}</p>
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
            <p class="label">Motif de lavoir</p>
            <p class="value">{{ $order->refund_reason ?: 'Aucun motif renseigne' }}</p>
            <p>Total rembourse : {{ number_format(abs((float) $order->refund_amount), 2, ',', ' ') }} {{ $currency }}</p>
            @if($order->legal_note)<p>{{ $order->legal_note }}</p>@endif
        </div>
    </section>

    <table>
        <thead>
        <tr>
            <th>Produit</th>
            <th class="num">Qte remboursee</th>
            <th class="num">P.U. HT</th>
            <th class="num">TVA</th>
            <th class="num">Total HT</th>
            <th class="num">Total TTC</th>
        </tr>
        </thead>
        <tbody>
        @foreach($order->items as $item)
            <tr>
                <td>{{ $item->product_name_snapshot }}</td>
                <td class="num">{{ rtrim(rtrim(number_format(abs((float) $item->quantity), 3, ',', ' '), '0'), ',') }}</td>
                <td class="num">{{ number_format((float) $item->unit_price_ht, 2, ',', ' ') }} {{ $currency }}</td>
                <td class="num">{{ number_format((float) ($item->vat_rate ?? $order->vat_rate ?? 0), 2, ',', ' ') }}%</td>
                <td class="num">-{{ number_format(abs((float) $item->subtotal_ht), 2, ',', ' ') }} {{ $currency }}</td>
                <td class="num">-{{ number_format(abs((float) $item->subtotal_ttc), 2, ',', ' ') }} {{ $currency }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>

    <section class="totals">
        <div class="totals-row"><span>Total HT</span><strong>-{{ number_format(abs((float) $order->subtotal_ht), 2, ',', ' ') }} {{ $currency }}</strong></div>
        <div class="totals-row"><span>TVA</span><strong>-{{ number_format(abs((float) $order->total_vat), 2, ',', ' ') }} {{ $currency }}</strong></div>
        <div class="totals-row total-ttc"><span>Total avoir TTC</span><strong>-{{ number_format(abs((float) $order->total_ttc), 2, ',', ' ') }} {{ $currency }}</strong></div>
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
