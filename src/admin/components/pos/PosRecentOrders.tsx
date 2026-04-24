import { PackageCheck, Printer, ShoppingBag } from 'lucide-react';
import type { Order, OrderStatus } from '../../api/types';
import { money, time } from '../../utils/format';
import { StatusBadge } from '../StatusBadge';

export function PosRecentOrders({
  onPrint,
  onStatus,
  orders,
}: {
  orders: Order[];
  onPrint: (order: Order) => void;
  onStatus: (id: number, status: OrderStatus) => void;
}) {
  return (
    <section className="rounded-[2rem] border border-grove/10 bg-white p-4 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold text-grove">Commandes du jour</h2>
        <span className="rounded-full bg-leaf-50 px-3 py-1 text-xs font-bold text-leaf-700">{orders.length}</span>
      </div>
      <div className="grid max-h-80 gap-2 overflow-y-auto">
        {orders.slice(0, 8).map((order) => (
          <article key={order.id} className="grid gap-2 rounded-2xl bg-cream p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{order.order_number}</p>
                <p className="text-xs font-semibold text-grove/55">{order.customer.full_name} - {time(order.pickup_time)}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-display font-semibold">{money(order.total_amount)}</span>
              <div className="flex gap-1">
                <button type="button" className="grid h-8 w-8 place-items-center rounded-full bg-white text-grove" onClick={() => onPrint(order)} aria-label="Imprimer">
                  <Printer size={14} />
                </button>
                <button type="button" className="grid h-8 w-8 place-items-center rounded-full bg-leaf-50 text-leaf-700" onClick={() => onStatus(order.id, 'ready')} aria-label="Marquer prete">
                  <PackageCheck size={14} />
                </button>
                <button type="button" className="grid h-8 w-8 place-items-center rounded-full bg-grove text-cream" onClick={() => onStatus(order.id, 'picked_up')} aria-label="Marquer retiree">
                  <ShoppingBag size={14} />
                </button>
              </div>
            </div>
          </article>
        ))}
        {orders.length === 0 && <p className="rounded-2xl bg-cream p-4 text-sm font-semibold text-grove/55">Aucune commande aujourd'hui.</p>}
      </div>
    </section>
  );
}
