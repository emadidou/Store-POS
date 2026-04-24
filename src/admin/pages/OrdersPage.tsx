import { Edit, Eye, Plus, RotateCcw, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/client';
import type { Order, OrderStatus } from '../api/types';
import { DataTable } from '../components/DataTable';
import { ConfirmModal } from '../components/ConfirmModal';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { PaginationBar } from '../components/PaginationBar';
import { SearchInput } from '../components/SearchInput';
import { StatusBadge, statusLabels } from '../components/StatusBadge';
import { money, shortDate, time } from '../utils/format';
import { adminInputClass, FormField } from '../components/FormField';

const statuses: Array<OrderStatus | 'all'> = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'cancelled'];
const emptyFilters = {
  search: '',
  status: '',
  payment_status: '',
  payment_method: '',
  source: '',
  order_type: '',
  document_type: '',
  date_from: '',
  date_to: '',
  pickup_date: '',
  sort: 'newest',
};

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState(emptyFilters);
  const [isFiltering, setIsFiltering] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCancelled = false;
    setIsFiltering(true);

    const timeout = window.setTimeout(() => {
      setError('');
      adminApi.ordersPage(cleanFilters(filters), currentPage)
        .then((payload) => {
          if (isCancelled) return;
          setOrders(payload.data);
          setCurrentPage(payload.currentPage);
          setLastPage(payload.lastPage);
          setTotal(payload.total);
        })
        .catch((loadError) => {
          if (!isCancelled) setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les commandes.');
        })
        .finally(() => {
          if (!isCancelled) setIsFiltering(false);
        });
    }, 250);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeout);
    };
  }, [currentPage, filters]);

  const updateFilter = (key: keyof typeof emptyFilters, value: string) => {
    setCurrentPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => setFilters(emptyFilters);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await adminApi.deleteOrder(deleteId);
      setOrders((current) => current?.filter((order) => order.id !== deleteId) ?? []);
      setTotal((current) => Math.max(0, current - 1));
      setDeleteId(null);
    } catch (deleteError) {
      setDeleteId(null);
      window.alert(deleteError instanceof Error ? deleteError.message : 'Impossible de supprimer cette commande.');
    }
  };

  if (error && !orders) return <ErrorState title="Commandes indisponibles" description={error} />;
  if (!orders) return <LoadingState label="Chargement des commandes..." />;

  return (
    <>
      <PageHeader title="Commandes" description="Suivez les commandes a preparer pour le retrait magasin." action={<Link className="btn btn-primary" to="/admin/orders/new"><Plus size={17} /> Ajouter une commande</Link>} />
      {error && <p className="mb-4 rounded-2xl bg-tomato/10 p-3 text-sm font-semibold text-tomato">{error}</p>}
      <section className="mb-5 rounded-[1.5rem] border border-grove/10 bg-white/85 p-4 shadow-[0_1px_0_rgba(31,77,54,0.08)]">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-[1.35fr_repeat(4,minmax(150px,1fr))]">
            <FormField label="Recherche">
              <SearchInput value={filters.search} onChange={(value) => updateFilter('search', value)} placeholder="Commande, facture, client..." />
            </FormField>
            <FormField label="Statut commande">
              <select className={adminInputClass} value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
                {statuses.map((item) => <option key={item} value={item === 'all' ? '' : item}>{item === 'all' ? 'Tous les statuts' : statusLabels[item]}</option>)}
              </select>
            </FormField>
            <FormField label="Paiement">
              <select className={adminInputClass} value={filters.payment_status} onChange={(event) => updateFilter('payment_status', event.target.value)}>
                <option value="">Tous</option>
                <option value="pending">En attente</option>
                <option value="paid">Payee</option>
                <option value="failed">Echec</option>
              </select>
            </FormField>
            <FormField label="Document">
              <select className={adminInputClass} value={filters.document_type} onChange={(event) => updateFilter('document_type', event.target.value)}>
                <option value="">Tous</option>
                <option value="invoice">Factures</option>
                <option value="order_voucher">Bons de commande</option>
              </select>
            </FormField>
            <FormField label="Source">
              <select className={adminInputClass} value={filters.source} onChange={(event) => updateFilter('source', event.target.value)}>
                <option value="">Toutes</option>
                <option value="pos">POS caisse</option>
                <option value="web">En ligne</option>
                <option value="admin">Admin</option>
              </select>
            </FormField>
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-[repeat(6,minmax(140px,1fr))_auto] xl:items-end">
          <FormField label="Type commande">
            <select className={adminInputClass} value={filters.order_type} onChange={(event) => updateFilter('order_type', event.target.value)}>
              <option value="">Tous</option>
              <option value="in_store">Sur place</option>
              <option value="pickup">Retrait</option>
              <option value="reservation">Reservation</option>
            </select>
          </FormField>
          <FormField label="Mode paiement">
            <select className={adminInputClass} value={filters.payment_method} onChange={(event) => updateFilter('payment_method', event.target.value)}>
              <option value="">Tous</option>
              <option value="cash">Cash</option>
              <option value="stripe_later_ready">Reception</option>
              <option value="stripe">Carte</option>
            </select>
          </FormField>
          <FormField label="Date commande debut">
            <input className={adminInputClass} type="date" value={filters.date_from} onChange={(event) => updateFilter('date_from', event.target.value)} />
          </FormField>
          <FormField label="Date commande fin">
            <input className={adminInputClass} type="date" value={filters.date_to} onChange={(event) => updateFilter('date_to', event.target.value)} />
          </FormField>
          <FormField label="Date retrait">
            <input className={adminInputClass} type="date" value={filters.pickup_date} onChange={(event) => updateFilter('pickup_date', event.target.value)} />
          </FormField>
          <FormField label="Tri">
            <select className={adminInputClass} value={filters.sort} onChange={(event) => updateFilter('sort', event.target.value)}>
              <option value="newest">Plus recentes</option>
              <option value="oldest">Plus anciennes</option>
              <option value="pickup_asc">Retrait proche</option>
              <option value="pickup_desc">Retrait lointain</option>
              <option value="total_desc">Total eleve</option>
              <option value="total_asc">Total faible</option>
            </select>
          </FormField>
          <button type="button" className="btn btn-secondary h-12 justify-center" onClick={resetFilters}>
            <RotateCcw size={16} />
            Reset
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-grove/45">
          <SlidersHorizontal size={15} />
          <span>{total} commande{total > 1 ? 's' : ''}</span>
          {isFiltering && <span className="rounded-full bg-leaf-50 px-2 py-1 text-leaf-700">Filtrage...</span>}
        </div>
      </section>

      {orders.length === 0 ? <EmptyState title="Aucune commande trouvee" /> : (
        <DataTable
          columns={['Numero', 'Client', 'Telephone', 'Total', 'Statut', 'Paiement', 'Document', 'Retrait', 'Action']}
          rows={orders.map((order) => (
            <tr key={order.id} className="hover:bg-leaf-50/45">
              <td className="px-5 py-4 font-semibold">{order.order_number}</td>
              <td className="px-5 py-4">{order.customer.full_name}</td>
              <td className="px-5 py-4 text-grove/65">{order.customer.phone}</td>
              <td className="px-5 py-4 font-semibold">{money(order.total_amount)}</td>
              <td className="px-5 py-4"><StatusBadge status={order.status} /></td>
              <td className="px-5 py-4">{paymentLabel(order.payment_status ?? (order.is_paid ? 'paid' : 'pending'))}</td>
              <td className="px-5 py-4">{documentLabel(order.document_type)}</td>
              <td className="px-5 py-4">{shortDate(order.pickup_date)} - {time(order.pickup_time)}</td>
              <td className="px-5 py-4">
                <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
                  <Link className="inline-grid h-9 w-9 place-items-center rounded-full bg-grove text-cream" to={`/admin/orders/${order.id}`} aria-label="Voir la commande" title="Voir">
                    <Eye size={15} />
                  </Link>
                  {canMutateOrder(order) ? (
                    <>
                      <Link className="inline-grid h-9 w-9 place-items-center rounded-full bg-leaf-50 text-leaf-700" to={`/admin/orders/${order.id}/edit`} aria-label="Editer la commande" title="Editer">
                        <Edit size={15} />
                      </Link>
                      <button className="inline-grid h-9 w-9 place-items-center rounded-full bg-tomato/10 text-tomato" type="button" onClick={() => setDeleteId(order.id)} aria-label="Supprimer la commande" title="Supprimer">
                        <Trash2 size={15} />
                      </button>
                    </>
                  ) : (
                    <span className="rounded-full bg-cream px-3 py-2 text-xs font-bold text-grove/45" title="Facture verrouillee">Verrouillee</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        />
      )}
      <PaginationBar currentPage={currentPage} lastPage={lastPage} total={total} onPageChange={setCurrentPage} />
      <ConfirmModal isOpen={Boolean(deleteId)} title="Supprimer cette commande ?" description="Cette action supprimera la commande et restaurera le stock des produits concernes." onCancel={() => setDeleteId(null)} onConfirm={confirmDelete} />
    </>
  );
}

function canMutateOrder(order: Order) {
  return order.document_type !== 'invoice' && order.payment_status !== 'paid' && !order.is_paid && !order.invoice_number;
}

function cleanFilters(filters: typeof emptyFilters) {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '')) as Record<string, string>;
}

function paymentLabel(status?: string | null) {
  const labels: Record<string, string> = {
    pending: 'En attente',
    paid: 'Payee',
    failed: 'Echec',
  };

  return labels[status ?? ''] ?? '-';
}

function documentLabel(type?: string | null) {
  const labels: Record<string, string> = {
    invoice: 'Facture',
    order_voucher: 'Bon',
  };

  return labels[type ?? ''] ?? '-';
}
