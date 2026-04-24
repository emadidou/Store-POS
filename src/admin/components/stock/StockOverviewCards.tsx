import type { StockStats, StoreSettings } from '../../api/types';
import { money } from '../../utils/format';

export function StockOverviewCards({
  stats,
  currency = 'EUR',
}: {
  stats: StockStats;
  currency?: StoreSettings['currency'];
}) {
  const cards = [
    { label: 'Total produits', value: stats.totals.total_products, hint: 'catalogue suivi', tone: 'default' },
    { label: 'En stock', value: stats.totals.in_stock_products, hint: 'niveau confortable', tone: 'success' },
    { label: 'Stock faible', value: stats.totals.low_stock_products, hint: 'reassort recommande', tone: 'warning' },
    { label: 'Ruptures', value: stats.totals.out_of_stock_products, hint: 'priorite terrain', tone: 'danger' },
  ] as const;

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className={`rounded-[1.5rem] border border-grove/10 p-5 shadow-soft ${toneClasses[card.tone]}`}>
            <p className="text-xs font-bold uppercase tracking-[0.14em] opacity-70">{card.label}</p>
            <p className="mt-3 text-4xl font-black">{card.value}</p>
            <p className="mt-2 text-sm font-medium opacity-80">{card.hint}</p>
          </article>
        ))}
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-3">
        <StatStripe label="Produits disponibles" value={stats.totals.available_products} />
        <StatStripe label="Stock cumule" value={stats.totals.stock_units_total} />
        <StatStripe label="Valeur estimee" value={money(stats.totals.stock_value_total, currency ?? 'EUR')} />
      </section>
    </>
  );
}

function StatStripe({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-[1.35rem] border border-grove/10 bg-white p-4 shadow-soft">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-grove/45">{label}</p>
      <p className="mt-3 text-2xl font-black text-grove">{value}</p>
    </article>
  );
}

const toneClasses = {
  default: 'bg-white text-grove',
  success: 'bg-leaf-50 text-leaf-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-tomato/10 text-tomato',
};
