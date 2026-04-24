import type { Order, StoreSettings } from '../../api/types';
import { money, shortDate, time } from '../../utils/format';
import { InvoiceFooter } from './InvoiceFooter';

export function OrderVoucherView({ order, settings }: { order: Order; settings: StoreSettings }) {
  return (
    <article className="commercial-document mx-auto bg-white text-black">
      <DocumentHeader title="Bon de commande" settings={settings} />

      <section className="commercial-document-banner">
        <div>
          <span>Commande</span>
          <strong>{order.order_number}</strong>
        </div>
        <div>
          <span>Date</span>
          <strong>{shortDate(order.created_at)}</strong>
        </div>
        <div>
          <span>Retrait</span>
          <strong>{shortDate(order.pickup_date)} - {time(order.pickup_time)}</strong>
        </div>
        <div>
          <span>Paiement</span>
          <strong>Paiement a la reception</strong>
        </div>
      </section>

      <section className="commercial-document-grid">
        <InfoBlock title="Client">
          <p>{order.customer.full_name || 'Client caisse'}</p>
          <p>{order.customer.phone || '-'}</p>
          {order.customer.email && <p>{order.customer.email}</p>}
        </InfoBlock>
        <InfoBlock title="Mention">
          <p>Ce document est un bon de commande, il ne constitue pas une facture.</p>
          <p>Paiement a la reception.</p>
        </InfoBlock>
      </section>

      <OrderLinesTable order={order} settings={settings} mode="voucher" />

      <section className="commercial-document-total">
        <span>Total estime</span>
        <strong>{money(order.total_amount, settings.currency)}</strong>
      </section>

      <section className="commercial-document-note">
        <strong>Presentez ce bon lors du retrait.</strong>
        <span>La facture definitive sera emise apres paiement.</span>
      </section>

      <InvoiceFooter settings={settings} />
    </article>
  );
}

export function DocumentHeader({ settings, title }: { settings: StoreSettings; title: string }) {
  const companyName = settings.company_name || settings.store_name;
  const identifiers = [
    settings.siren ? `SIREN : ${settings.siren}` : null,
    settings.siret ? `SIRET : ${settings.siret}` : null,
    settings.ape_code ? `APE/NAF : ${settings.ape_code}` : null,
    settings.rc ? `RCS${settings.rcs_city ? ` ${settings.rcs_city}` : ''} : ${settings.rc}` : null,
    settings.vat_number ? `TVA intracommunautaire : ${settings.vat_number}` : null,
    settings.ice ? `ICE : ${settings.ice}` : null,
  ].filter(Boolean);

  return (
    <header className="commercial-document-header">
      <div>
        <h1>{companyName}</h1>
        {(settings.legal_form || settings.share_capital) && (
          <p>
            {[settings.legal_form, settings.share_capital ? `Capital social : ${money(settings.share_capital, settings.currency)}` : null]
              .filter(Boolean)
              .join(' - ')}
          </p>
        )}
        {settings.address && <p>{settings.address}</p>}
        <p>{settings.phone}{settings.email ? ` - ${settings.email}` : ''}</p>
        {identifiers.length > 0 && <p>{identifiers.join(' - ')}</p>}
      </div>
      <div className="commercial-document-title">{title}</div>
    </header>
  );
}

export function InfoBlock({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="commercial-document-info">
      <span>{title}</span>
      {children}
    </div>
  );
}

export function OrderLinesTable({ mode, order, settings }: { mode: 'invoice' | 'voucher'; order: Order; settings: StoreSettings }) {
  const vatRate = getDocumentVatRate(order, settings);

  return (
    <table className="commercial-document-table">
      <thead>
        <tr>
          <th>Produit</th>
          <th>Qte</th>
          <th>{mode === 'invoice' ? 'P.U. HT' : 'P.U.'}</th>
          {mode === 'invoice' && <th>TVA</th>}
          <th>{mode === 'invoice' ? 'Total HT' : 'Sous-total'}</th>
          {mode === 'invoice' && <th>Total TTC</th>}
        </tr>
      </thead>
      <tbody>
        {(order.items ?? []).map((item) => {
          const lineVatRate = Number(item.vat_rate ?? vatRate);
          const unitHt = Number(item.unit_price_ht ?? item.unit_price);
          const subtotalHt = Number(item.subtotal_ht ?? item.subtotal);
          const subtotalTtc = Number(item.subtotal_ttc ?? item.subtotal);

          return (
            <tr key={item.id}>
              <td>{item.product_name_snapshot}</td>
              <td>{item.quantity}</td>
              <td>{money(mode === 'invoice' ? unitHt : item.unit_price, settings.currency)}</td>
              {mode === 'invoice' && <td>{lineVatRate.toLocaleString('fr-FR')}%</td>}
              <td>{money(mode === 'invoice' ? subtotalHt : item.subtotal, settings.currency)}</td>
              {mode === 'invoice' && <td>{money(subtotalTtc, settings.currency)}</td>}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function getDocumentVatRate(order: Order, settings: StoreSettings) {
  if (order.vat_rate !== undefined && order.vat_rate !== null) {
    return Number(order.vat_rate);
  }

  const firstLineVatRate = order.items?.find((item) => item.vat_rate !== undefined && item.vat_rate !== null)?.vat_rate;
  if (firstLineVatRate !== undefined && firstLineVatRate !== null) {
    return Number(firstLineVatRate);
  }

  return settings.vat_exempt ? 0 : Number(settings.vat_rate ?? 5.5);
}
