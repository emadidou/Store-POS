import { Edit, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../api/client';
import type { Customer } from '../api/types';
import { ConfirmModal } from '../components/ConfirmModal';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { money, shortDate, time } from '../utils/format';

export function CustomerDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.customer(id).then(setCustomer).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger le client.');
    });
  }, [id]);

  if (error && !customer) return <ErrorState title="Client indisponible" description={error} />;
  if (!customer) return <LoadingState label="Chargement du client..." />;

  const deleteCustomer = async () => {
    try {
      await adminApi.deleteCustomer(customer.id);
      navigate('/admin/customers');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Suppression impossible.');
      setIsDeleteOpen(false);
    }
  };

  return (
    <>
      <PageHeader
        title={customer.full_name}
        description="Informations client et historique de commandes."
        action={(
          <div className="flex flex-wrap gap-2">
            <Link className="btn btn-secondary" to="/admin/customers">Retour</Link>
            <Link className="btn btn-primary" to={`/admin/customers/${customer.id}/edit`}><Edit size={17} /> Editer</Link>
            <button className="btn btn-secondary text-tomato" type="button" onClick={() => setIsDeleteOpen(true)}><Trash2 size={17} /> Supprimer</button>
          </div>
        )}
      />
      {error && <p className="mb-4 rounded-2xl bg-tomato/10 p-3 text-sm font-semibold text-tomato">{error}</p>}
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-[1.5rem] border border-grove/10 bg-white p-5 shadow-soft">
          <Info label="Telephone" value={customer.phone} />
          <Info label="Email" value={customer.email ?? '-'} />
          <Info label="Commandes" value={String(customer.orders_count)} />
          <Info label="Derniere commande" value={shortDate(customer.last_order_at)} />
        </aside>
        <section className="rounded-[1.5rem] border border-grove/10 bg-white p-5 shadow-soft">
          <h2 className="font-display text-2xl font-semibold">Historique</h2>
          <div className="mt-4 grid gap-3">
            {(customer.orders ?? []).map((order) => (
              <Link key={order.id} to={`/admin/orders/${order.id}`} className="grid gap-3 rounded-2xl bg-cream p-4 sm:grid-cols-[1fr_auto]">
                <div><p className="font-semibold">{order.order_number}</p><p className="text-sm text-grove/60">{shortDate(order.pickup_date)} a {time(order.pickup_time)}</p></div>
                <div className="flex items-center gap-3"><StatusBadge status={order.status} /><span className="font-semibold">{money(order.total_amount)}</span></div>
              </Link>
            ))}
          </div>
        </section>
      </div>
      <ConfirmModal isOpen={isDeleteOpen} title="Supprimer ce client ?" description="La suppression est bloquee si le client possede deja des commandes." onCancel={() => setIsDeleteOpen(false)} onConfirm={deleteCustomer} />
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="mb-3 rounded-2xl bg-cream p-4"><p className="text-xs font-bold uppercase tracking-[0.13em] text-grove/45">{label}</p><p className="mt-1 font-semibold">{value}</p></div>;
}
