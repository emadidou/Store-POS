import type { Order, StoreSettings } from '../../api/types';
import { money, shortDate } from '../../utils/format';
import { InvoiceFooter } from './InvoiceFooter';
import { getDocumentVatRate } from './OrderVoucherView';

export function InvoiceView({ order, settings }: { order: Order; settings: StoreSettings }) {
  const vatRate = getDocumentVatRate(order, settings);
  const totalTtc = Number(order.total_ttc ?? order.total_amount ?? 0);
  const totalHt = Number(order.subtotal_ht ?? totalTtc);
  const totalVat = Number(order.total_vat ?? 0);
  const companyName = settings.company_name || settings.store_name;
  const initials = companyName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return (
    <article className="premium-invoice commercial-document mx-auto bg-white text-black">
      <header className="premium-invoice-header">
        <div className="premium-invoice-brand">
          <div className="premium-invoice-logo">{initials || 'MV'}</div>
          <div>
            <h1>{companyName}</h1>
            <p>{settings.legal_form ? `${settings.legal_form} - ` : ''}{settings.store_name}</p>
          </div>
        </div>
        <div className="premium-invoice-contact">
          {settings.address && <p>{settings.address}</p>}
          <p>{settings.phone}{settings.email ? ` - ${settings.email}` : ''}</p>
        </div>
      </header>

      <section className="premium-invoice-hero">
        <p className="premium-invoice-kicker">FACTURE</p>
        <h2>{order.invoice_number || order.order_number}</h2>
        <div className="premium-invoice-status-row">
          <span>PAYEE</span>
          <small>{shortDate(order.paid_at ?? order.created_at)}</small>
        </div>
        <p className="premium-invoice-reference">Commande {order.order_number}</p>
      </section>

      <section className="premium-invoice-info-grid">
        <div>
          <span>Client</span>
          <strong>{order.customer.full_name || 'Client caisse'}</strong>
          <p>{order.customer.phone || '-'}</p>
          {order.customer.email && <p>{order.customer.email}</p>}
        </div>
        <div>
          <span>Reglement</span>
          <strong>{formatPaymentMethod(order.payment_method)}</strong>
          <p>Facture acquittee le {shortDate(order.paid_at ?? order.created_at)}</p>
          {settings.vat_exempt && <p>TVA non applicable, art. 293B du CGI.</p>}
        </div>
      </section>

      <table className="premium-invoice-table">
        <thead>
          <tr>
            <th>Produit</th>
            <th>Qte</th>
            <th>Prix</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {(order.items ?? []).map((item) => {
            const lineVatRate = Number(item.vat_rate ?? vatRate);
            const unitHt = Number(item.unit_price_ht ?? item.unit_price);
            const subtotalTtc = Number(item.subtotal_ttc ?? item.subtotal);

            return (
              <tr key={item.id}>
                <td>{item.product_name_snapshot}</td>
                <td>{formatQuantity(item.quantity)}</td>
                <td>
                  <div>{money(unitHt, settings.currency)}</div>
                  <small className="text-xs text-grove/55">TVA {lineVatRate.toLocaleString('fr-FR')}%</small>
                </td>
                <td>{money(subtotalTtc, settings.currency)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <section className="premium-invoice-summary">
        <div><span>Total HT</span><strong>{money(totalHt, settings.currency)}</strong></div>
        <div><span>TVA {vatRate.toLocaleString('fr-FR')}%</span><strong>{money(totalVat, settings.currency)}</strong></div>
        <div className="premium-invoice-total"><span>Total TTC</span><strong>{money(totalTtc, settings.currency)}</strong></div>
      </section>

      <InvoiceFooter settings={settings} />
    </article>
  );
}

function formatPaymentMethod(method: string) {
  const labels: Record<string, string> = {
    cash: 'Especes',
    stripe: 'Carte bancaire',
    stripe_later_ready: 'Paiement regle',
  };

  return labels[method] ?? method;
}

function formatQuantity(value: number) {
  const quantity = Number(value);
  return Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
}
