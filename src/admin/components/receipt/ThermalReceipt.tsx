import type { Order, StoreSettings } from '../../api/types';
import { money, shortDate, time } from '../../utils/format';

const paymentLabels: Record<string, string> = {
  cash: 'Especes',
  stripe_later_ready: 'Paiement a la reception',
  stripe: 'Carte',
};

export function ThermalReceipt({
  order,
  store,
}: {
  order: Order | null;
  store?: Partial<StoreSettings> | null;
}) {
  if (!order) return null;

  const isPaid = order.document_type === 'invoice' || order.payment_status === 'paid' || Boolean(order.is_paid || order.invoice_number);
  const isCounterSale = (order.source === 'pos' || order.source === 'pos-caisse' || order.source === 'caisse')
    && (order.order_type === 'in_store' || order.customer.phone === 'POS-CAISSE');
  const showPickup = !isCounterSale && Boolean(order.pickup_date && order.pickup_time);
  const paymentLabel = formatPaymentMethod(order.payment_method, isPaid);

  return (
    <article className="thermal-receipt bg-white text-black">
      <header className="receipt-section text-center">
        <h1 className="receipt-store-name">{store?.store_name ?? 'Maison Verde'}</h1>
        {store?.phone && <p>{store.phone}</p>}
      </header>

      <section className="receipt-section text-center">
        <p className="receipt-label">{isPaid ? 'Facture' : 'Bon de commande'}</p>
        <p className="receipt-order-number">{isPaid ? (order.invoice_number ?? order.order_number) : order.order_number}</p>
        {showPickup && <p className="receipt-pickup">Retrait: {shortDate(order.pickup_date)} {time(order.pickup_time)}</p>}
        <p className="receipt-status">{isPaid ? 'PAYEE' : 'A REGLER'}</p>
      </section>

      <section className="receipt-section">
        <ReceiptRow label="Date" value={shortDate(order.created_at)} />
        <ReceiptRow label="Client" value={order.customer.full_name || 'Client caisse'} />
        <ReceiptRow label="Tel." value={order.customer.phone || '-'} />
        <ReceiptRow label="Paiement" value={paymentLabel} />
      </section>

      <section className="receipt-section">
        <div className="receipt-table-head">
          <span>Article</span>
          <span>Qt</span>
          <span>P.U.</span>
          <span>Total</span>
        </div>
        {(order.items ?? []).map((item) => (
          <div key={item.id} className="receipt-line">
            <span>{item.product_name_snapshot}</span>
            <span>{formatQuantity(item.quantity)}</span>
            <span>{money(item.unit_price)}</span>
            <span>{money(item.subtotal)}</span>
          </div>
        ))}
      </section>

      <footer className="receipt-section">
        <div className="receipt-total">
          <span>Total</span>
          <strong>{money(order.total_amount)}</strong>
        </div>
        {isPaid ? (
          <div className="receipt-drive-box">
            <p>Facture acquittee</p>
            <p>Reglee - {paymentLabel}</p>
            {showPickup && <p>Commande a retirer a l'heure indiquee</p>}
          </div>
        ) : (
          <div className="receipt-drive-box">
            <p>Presentez ce bon lors du retrait</p>
            <p>Paiement a la reception</p>
            <p>Ce document n'est pas une facture</p>
          </div>
        )}
        <p className="mt-3 text-center">{isPaid ? 'Merci pour votre achat.' : 'Merci pour votre commande.'}</p>
        <ReceiptLegalFooter store={store} />
      </footer>
    </article>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="receipt-row">
      <span>{label}</span>
      <strong>{value || '-'}</strong>
    </div>
  );
}

function formatQuantity(value: number) {
  const quantity = Number(value);
  return Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
}

function formatPaymentMethod(method: string, isPaid: boolean) {
  if (method === 'stripe_later_ready' && isPaid) {
    return 'Paiement regle';
  }

  if (!isPaid && method === 'cash') {
    return 'Paiement a la reception';
  }

  return paymentLabels[method] ?? method;
}

function ReceiptLegalFooter({ store }: { store?: Partial<StoreSettings> | null }) {
  if (!store) return null;

  const companyName = store.company_name || store.store_name;
  const legalLine = [companyName, store.legal_form, store.share_capital ? `Capital ${money(store.share_capital, store.currency)}` : null]
    .filter(Boolean)
    .join(' - ');
  const contactLine = [store.address, store.phone ? `Tel ${store.phone}` : null, store.email]
    .filter(Boolean)
    .join(' - ');
  const rcs = store.rc ? `RCS${store.rcs_city ? ` ${store.rcs_city}` : ''} ${store.rc}` : null;
  const identifiers = [
    store.siren ? `SIREN ${store.siren}` : null,
    store.siret ? `SIRET ${store.siret}` : null,
    store.ape_code ? `APE ${store.ape_code}` : null,
    rcs,
    store.vat_number ? `TVA ${store.vat_number}` : null,
    store.ice ? `ICE ${store.ice}` : null,
  ].filter(Boolean);

  if (!legalLine && !contactLine && identifiers.length === 0) return null;

  return (
    <div className="receipt-legal-footer">
      {legalLine && <p>{legalLine}</p>}
      {contactLine && <p>{contactLine}</p>}
      {identifiers.length > 0 && <p>{identifiers.join(' - ')}</p>}
    </div>
  );
}
