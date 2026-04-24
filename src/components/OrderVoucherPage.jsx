import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getOrderVoucher } from '../api/orders';
import { formatPrice } from '../utils/order.js';

const statusLabels = {
  pending: 'En attente',
  confirmed: 'Confirmee',
  preparing: 'Preparation',
  ready: 'Prete',
  picked_up: 'Recuperee',
  cancelled: 'Annulee',
};

export function OrderVoucherPage({ onNavigate }) {
  const { orderNumber = '' } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [voucher, setVoucher] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderNumber || !token) {
      setError('Ce lien de bon de commande est invalide.');
      return;
    }

    getOrderVoucher(orderNumber, token)
      .then(setVoucher)
      .catch(() => setError('Impossible de charger ce bon de commande. Verifiez votre lien.'));
  }, [orderNumber, token]);

  return (
    <section className="min-h-screen bg-cream px-5 py-8 text-grove sm:px-6 lg:px-8">
      <div className="client-print-hide mx-auto mb-6 flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" className="btn btn-secondary justify-center" onClick={() => onNavigate('/')}>
          <ArrowLeft size={17} />
          Retour a l'accueil
        </button>
        {voucher && (
          <button type="button" className="btn btn-primary justify-center" onClick={() => window.print()}>
            <Printer size={17} />
            Telecharger / imprimer le bon
          </button>
        )}
      </div>

      {error ? (
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-tomato/20 bg-white p-8 text-center shadow-soft">
          <AlertCircle className="mx-auto text-tomato" size={34} />
          <h1 className="mt-4 font-display text-3xl font-semibold">Bon indisponible</h1>
          <p className="mt-3 text-grove/65">{error}</p>
        </div>
      ) : voucher ? (
        <VoucherDocument voucher={voucher} />
      ) : (
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-grove/10 bg-white p-8 text-center shadow-soft">
          <p className="font-semibold text-grove/70">Chargement du bon de commande...</p>
        </div>
      )}
    </section>
  );
}

function VoucherDocument({ voucher }) {
  const { order, store } = voucher;

  return (
    <motion.article
      className="client-voucher-document mx-auto max-w-4xl rounded-[2rem] border border-grove/10 bg-white p-6 shadow-soft sm:p-10"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className="border-b border-grove/10 pb-7">
        <div className="flex flex-col justify-between gap-6 sm:flex-row">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700 print:text-gray-600">Bon de commande</p>
            <h1 className="mt-3 font-display text-3xl font-semibold text-grove print:text-black">{store.store_name}</h1>
            <div className="mt-3 space-y-1 text-sm leading-6 text-grove/65 print:text-gray-700">
              {store.address && <p>{store.address}</p>}
              <p>{store.phone}</p>
              {store.email && <p>{store.email}</p>}
            </div>
          </div>
          <div className="rounded-2xl bg-cream p-5 text-left sm:text-right print:border print:border-gray-200 print:bg-white">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-grove/45 print:text-gray-500">Numero commande</p>
            <p className="mt-2 font-display text-2xl font-semibold text-grove print:text-black">{order.order_number}</p>
            <p className="mt-3 inline-flex rounded-full bg-leaf-50 px-3 py-1 text-xs font-bold text-leaf-700 print:border print:border-gray-300 print:bg-white print:text-black">
              {statusLabels[order.status] ?? order.status}
            </p>
          </div>
        </div>
      </header>

      <section className="mt-7 grid gap-4 sm:grid-cols-3">
        <InfoCard label="Date commande" value={formatDate(order.created_at)} />
        <InfoCard label="Retrait" value={formatDate(order.pickup_date)} />
        <InfoCard label="Heure" value={order.pickup_time} />
      </section>

      <section className="mt-7 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-cream p-5 print:border print:border-gray-200 print:bg-white">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-grove/45 print:text-gray-500">Client</p>
          <p className="mt-2 font-semibold text-grove print:text-black">{order.customer.full_name}</p>
          <p className="text-sm text-grove/65 print:text-gray-700">{order.customer.phone}</p>
          {order.customer.email && <p className="text-sm text-grove/65 print:text-gray-700">{order.customer.email}</p>}
        </div>
        <div className="rounded-2xl bg-leaf-50 p-5 text-sm leading-6 text-leaf-800 print:border print:border-gray-200 print:bg-white print:text-gray-700">
          <p className="font-bold text-grove print:text-black">Paiement a la reception</p>
          <p className="mt-2">Cette commande sera payee a la reception. Merci de presenter ce bon lors du retrait.</p>
        </div>
      </section>

      <div className="mt-8 overflow-hidden rounded-2xl border border-grove/10 print:rounded-none print:border-gray-300">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-grove text-cream print:bg-white print:text-black">
            <tr>
              <th className="px-4 py-3 print:border-b print:border-gray-300">Produit</th>
              <th className="px-4 py-3 text-center print:border-b print:border-gray-300">Quantite</th>
              <th className="px-4 py-3 text-right print:border-b print:border-gray-300">Prix unitaire</th>
              <th className="px-4 py-3 text-right print:border-b print:border-gray-300">Sous-total</th>
            </tr>
          </thead>
          <tbody>
            {(order.items ?? []).map((item) => (
              <tr key={item.id} className="border-t border-grove/8 print:border-gray-200">
                <td className="px-4 py-4 font-semibold print:text-black">{item.product_name_snapshot}</td>
                <td className="px-4 py-4 text-center text-grove/65 print:text-gray-700">{formatQuantity(item.quantity)}</td>
                <td className="px-4 py-4 text-right text-grove/65 print:text-gray-700">{formatPrice(item.unit_price, store.currency)}</td>
                <td className="px-4 py-4 text-right font-semibold print:text-black">{formatPrice(item.subtotal, store.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="mt-8 flex flex-col gap-4 border-t border-grove/10 pt-6 sm:flex-row sm:items-end sm:justify-between print:border-gray-300">
        <p className="max-w-lg text-sm leading-6 text-grove/60 print:text-gray-700">
          Merci pour votre commande. Ce document est un bon recapitulatif a presenter au comptoir lors du retrait. Il ne constitue pas une facture.
        </p>
        <div className="rounded-2xl bg-cream p-5 text-right print:border print:border-gray-200 print:bg-white">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-grove/45 print:text-gray-500">Total a payer</p>
          <p className="mt-1 font-display text-3xl font-semibold text-grove print:text-black">{formatPrice(order.total_amount, store.currency)}</p>
        </div>
      </footer>
    </motion.article>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-cream p-4 print:border print:border-gray-200 print:bg-white">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-grove/45 print:text-gray-500">{label}</p>
      <p className="mt-1 font-semibold text-grove print:text-black">{value}</p>
    </div>
  );
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(value));
}

function formatQuantity(value) {
  const quantity = Number(value);
  const formatted = Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(3).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',');
  return `${formatted} kg`;
}
