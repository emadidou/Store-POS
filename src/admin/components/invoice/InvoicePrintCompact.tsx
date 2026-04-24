import type { Order, StoreSettings } from '../../api/types';
import { money, shortDate, time } from '../../utils/format';
import { InvoiceFooter } from './InvoiceFooter';

export function InvoicePrintCompact({ order, settings }: { order: Order; settings: StoreSettings }) {
  const isPaid = order.document_type === 'invoice' || order.payment_status === 'paid' || Boolean(order.is_paid || order.invoice_number);
  const isCounterSale = (order.source === 'pos' || order.source === 'pos-caisse' || order.source === 'caisse')
    && (order.order_type === 'in_store' || order.customer.phone === 'POS-CAISSE');
  const showPickup = !isCounterSale && Boolean(order.pickup_date && order.pickup_time);

  return (
    <article className="invoice-print-compact mx-auto bg-white text-black">
      <header className="invoice-compact-header">
        <div className="invoice-compact-logo">MV</div>
        <div>
          <h1>{settings.store_name}</h1>
          <p>{settings.phone}{settings.email ? ` - ${settings.email}` : ''}</p>
        </div>
        <div className="invoice-compact-title">{isPaid ? 'Facture' : 'Bon drive'}</div>
      </header>

      <section className="invoice-compact-main">
        <div>
          <span>{isPaid ? 'Facture' : 'Commande'}</span>
          <strong className="invoice-compact-order">{isPaid ? (order.invoice_number ?? order.order_number) : order.order_number}</strong>
        </div>
        <Info label="Date commande" value={shortDate(order.created_at)} />
        {showPickup && <Info label="Retrait" value={`${shortDate(order.pickup_date)} - ${time(order.pickup_time)}`} strong />}
        <Info label="Statut" value={isPaid ? 'Payee' : 'A regler'} />
        <Info label="Paiement" value={formatPayment(order.payment_method, isPaid)} />
      </section>

      <section className="invoice-compact-client">
        <Info label="Client" value={order.customer.full_name || 'Client caisse'} />
        <Info label="Telephone" value={order.customer.phone || '-'} />
        {order.customer.email && <Info label="Email" value={order.customer.email} />}
      </section>

      <table className="invoice-compact-table">
        <thead>
          <tr>
            <th>Produit</th>
            <th>Qte</th>
            <th>P.U.</th>
            <th>Sous-total</th>
          </tr>
        </thead>
        <tbody>
          {(order.items ?? []).map((item) => (
            <tr key={item.id}>
              <td>{item.product_name_snapshot}</td>
              <td>{item.quantity}</td>
              <td>{money(item.unit_price)}</td>
              <td>{money(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="invoice-compact-total">
        <span>Total general</span>
        <strong>{money(order.total_amount)}</strong>
      </section>

      <footer className="invoice-compact-footer">
        {isPaid ? (
          <>
            <strong>Facture acquittee.</strong>
            <span>Merci pour votre achat.</span>
          </>
        ) : (
          <>
            <strong>Presentez ce bon lors du retrait.</strong>
            <span>Paiement a la reception.</span>
            <span>Ce document n'est pas une facture.</span>
          </>
        )}
      </footer>

      <InvoiceFooter settings={settings} />
    </article>
  );
}

function Info({ label, strong = false, value }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="invoice-compact-info">
      <span>{label}</span>
      <strong className={strong ? 'invoice-compact-highlight' : ''}>{value || '-'}</strong>
    </div>
  );
}

function formatPayment(method: string, isPaid: boolean) {
  const labels: Record<string, string> = {
    cash: isPaid ? 'Especes' : 'Paiement a la reception',
    stripe_later_ready: isPaid ? 'Paiement regle' : 'Paiement a la reception',
    stripe: 'Carte bancaire',
  };

  return labels[method] ?? method;
}
