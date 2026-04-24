import type { Order } from '../../api/types';
import { money } from '../../utils/format';

export function InvoiceSummary({ order }: { order: Order }) {
  const isPaid = order.document_type === 'invoice' || order.payment_status === 'paid' || Boolean(order.is_paid || order.invoice_number);

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_320px]">
      <div className="rounded-xl border-2 border-black bg-white p-4 text-black">
        <p className="text-xs font-black uppercase tracking-[0.16em]">{isPaid ? 'Reglement' : 'Bloc drive'}</p>
        <p className="mt-2 text-lg font-black">{isPaid ? 'Facture acquittee' : 'Presentez ce bon lors du retrait'}</p>
        <p className="font-bold">{formatPaymentMethod(order.payment_method, isPaid)}</p>
        <p className="font-semibold">{isPaid ? 'Merci pour votre achat' : "Ce document n'est pas une facture"}</p>
        {order.notes && (
          <>
            <p className="mt-4 text-xs font-black uppercase tracking-[0.16em]">Notes</p>
            <p className="mt-1 text-sm leading-6">{order.notes}</p>
          </>
        )}
      </div>

      <div className="rounded-xl border-4 border-black bg-white p-5 text-black">
        <div>
          <div className="flex items-end justify-between gap-4">
            <span className="text-xl font-black uppercase">Total</span>
            <span className="font-display text-4xl font-black">{money(order.total_amount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatPaymentMethod(method: string, isPaid: boolean) {
  const labels: Record<string, string> = {
    cash: isPaid ? 'Especes' : 'Paiement a la reception',
    stripe: 'Carte bancaire',
    stripe_later_ready: isPaid ? 'Paiement regle' : 'Paiement a la reception',
  };

  return labels[method] ?? method;
}
