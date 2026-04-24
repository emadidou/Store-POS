import { AlertTriangle, Clock3, Package, ShoppingBasket, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/client';
import type { Customer, Order, Product, StoreStatus } from '../api/types';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { money, shortDate, time } from '../utils/format';

export function DashboardPage() {
  const [data, setData] = useState<{ orders: Order[]; products: Product[]; customers: Customer[]; status: StoreStatus } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([adminApi.orders(), adminApi.products(), adminApi.customers(), adminApi.storeStatus()])
      .then(([orders, products, customers, status]) => {
        setData({ orders, products, customers, status });
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Impossible de charger le dashboard.');
      });
  }, []);

  if (error) return <ErrorState title="Dashboard indisponible" description={error} />;
  if (!data) return <LoadingState label="Chargement du dashboard..." />;

  const pending = data.orders.filter((order) => order.status === 'pending').length;
  const preparing = data.orders.filter((order) => order.status === 'preparing').length;
  const ready = data.orders.filter((order) => order.status === 'ready').length;
  const activeProducts = data.products.filter((product) => product.is_available).length;
  const lowStock = data.products.filter((product) => product.stock > 0 && product.stock <= (product.alert_threshold ?? 0));

  return (
    <>
      <PageHeader title="Dashboard" description="Vue rapide des commandes a preparer, produits actifs et etat du magasin." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric title="Commandes" value={data.orders.length} Icon={ShoppingBasket} />
        <Metric title="En attente" value={pending} Icon={Clock3} />
        <Metric title="Preparation" value={preparing} Icon={ShoppingBasket} />
        <Metric title="Pretes" value={ready} Icon={Package} />
        <Metric title="Clients" value={data.customers.length} Icon={UsersRound} />
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <section className="rounded-[1.5rem] border border-grove/10 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold">Commandes recentes</h2>
            <Link className="text-sm font-bold text-leaf-700" to="/admin/orders">Tout voir</Link>
          </div>
          <div className="mt-5 grid gap-3">
            {data.orders.slice(0, 5).map((order) => (
              <Link key={order.id} to={`/admin/orders/${order.id}`} className="grid gap-3 rounded-2xl border border-grove/8 bg-cream p-4 transition hover:bg-white hover:shadow-soft sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-semibold text-grove">{order.order_number}</p>
                  <p className="mt-1 text-sm text-grove/60">{order.customer.full_name} - retrait {shortDate(order.pickup_date)} a {time(order.pickup_time)}</p>
                </div>
                <div className="flex items-center gap-3 sm:justify-end">
                  <StatusBadge status={order.status} />
                  <span className="font-display font-semibold">{money(order.total_amount)}</span>
                </div>
              </Link>
            ))}
            {data.orders.length === 0 && <EmptyState title="Aucune commande" description="Les nouvelles commandes apparaitront ici." />}
          </div>
        </section>

        <aside className="grid gap-6">
          <section className="rounded-[1.5rem] border border-grove/10 bg-white p-5 shadow-soft">
            <h2 className="font-display text-2xl font-semibold">Etat magasin</h2>
            <div className="mt-4 rounded-2xl bg-leaf-50 p-4">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-leaf-700">{data.status.is_open ? 'Ouvert' : 'Ferme'}</p>
              <p className="mt-2 text-sm text-grove/65">{data.status.message}</p>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-grove/10 bg-white p-5 shadow-soft">
            <h2 className="font-display text-2xl font-semibold">Stock a surveiller</h2>
            <div className="mt-4 grid gap-3">
              {lowStock.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-2xl bg-cream p-3">
                  <span className="font-semibold">{product.name}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-tomato"><AlertTriangle size={15} /> {product.stock}</span>
                </div>
              ))}
              {lowStock.length === 0 && <p className="text-sm text-grove/60">Aucune rupture critique.</p>}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}

function Metric({ title, value, Icon }: { title: string; value: number; Icon: React.ElementType }) {
  return (
    <article className="rounded-[1.5rem] border border-grove/10 bg-white p-5 shadow-soft">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-leaf-50 text-leaf-700"><Icon size={20} /></span>
      <p className="mt-4 text-sm font-bold uppercase tracking-[0.14em] text-grove/45">{title}</p>
      <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
    </article>
  );
}
