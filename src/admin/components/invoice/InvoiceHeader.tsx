import type { Order, StoreSettings } from '../../api/types';
import { shortDate, time } from '../../utils/format';

export function InvoiceHeader({ order, settings }: { order: Order; settings: StoreSettings }) {
  const isPaid = order.document_type === 'invoice' || order.payment_status === 'paid' || Boolean(order.is_paid || order.invoice_number);
  const isCounterSale = (order.source === 'pos' || order.source === 'pos-caisse' || order.source === 'caisse')
    && (order.order_type === 'in_store' || order.customer.phone === 'POS-CAISSE');
  const showPickup = !isCounterSale && Boolean(order.pickup_date && order.pickup_time);
  const initials = settings.store_name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return (
    <header className="border-b-2 border-black pb-6 text-black">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
        <div className="flex gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border-2 border-black font-display text-lg font-black">
            {initials || 'MV'}
          </div>
          <div>
            <h1 className="font-display text-3xl font-black uppercase tracking-tight">{settings.store_name}</h1>
            <div className="mt-1 space-y-0.5 text-sm leading-5">
              <p>{settings.phone}</p>
              {settings.email && <p>{settings.email}</p>}
            </div>
          </div>
        </div>

        <div className="rounded-xl border-2 border-black p-4 text-left sm:text-right">
          <p className="text-xs font-black uppercase tracking-[0.2em]">{isPaid ? 'Facture' : 'Bon drive'}</p>
          <p className="mt-2 font-display text-4xl font-black leading-none">{isPaid ? (order.invoice_number ?? order.order_number) : order.order_number}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <InvoiceMeta label="Date commande" value={shortDate(order.created_at)} />
        {showPickup && <InvoiceMeta label="Retrait" value={`${shortDate(order.pickup_date)} - ${time(order.pickup_time)}`} featured />}
        <InvoiceMeta label="Statut" value={isPaid ? 'Payee' : 'A regler'} />
        <InvoiceMeta label="Paiement" value={formatPayment(order.payment_method, isPaid)} />
      </div>
    </header>
  );
}

function InvoiceMeta({ featured = false, label, value }: { label: string; value: string; featured?: boolean }) {
  return (
    <div className={`rounded-xl border-2 border-black p-3 ${featured ? 'sm:col-span-1' : ''}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.16em]">{label}</p>
      <p className={`${featured ? 'text-lg' : 'text-sm'} mt-1 font-black leading-tight`}>{value}</p>
    </div>
  );
}

function formatPayment(method: string, isPaid: boolean) {
  const labels: Record<string, string> = {
    cash: isPaid ? 'Especes' : 'Paiement a la reception',
    stripe: 'Carte bancaire',
    stripe_later_ready: isPaid ? 'Paiement regle' : 'Paiement a la reception',
  };

  return labels[method] ?? method;
}
