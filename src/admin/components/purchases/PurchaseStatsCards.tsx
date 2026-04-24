import type { PurchaseStats } from '../../api/types';
import { money } from '../../utils/format';

export function PurchaseStatsCards({ stats }: { stats: PurchaseStats }) {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <div className="grid gap-4 md:grid-cols-2">
        <Card label="Achats du mois" value={money(stats.month_total_ttc)} />
        <Card label="TVA achats du mois" value={money(stats.month_total_vat)} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ListCard title="Fournisseurs principaux" rows={stats.suppliers.map((item) => `${item.supplier} · ${money(item.total_ttc)}`)} />
        <ListCard title="Produits les plus achetes" rows={stats.products.map((item) => `${item.product} · ${item.quantity}`)} />
      </div>
    </section>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-3xl border border-grove/10 bg-white p-5 shadow-soft">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-grove/45">{label}</p>
      <p className="mt-3 font-display text-3xl font-semibold text-grove">{value}</p>
    </article>
  );
}

function ListCard({ title, rows }: { title: string; rows: string[] }) {
  return (
    <article className="rounded-3xl border border-grove/10 bg-white p-5 shadow-soft">
      <p className="font-display text-xl font-semibold text-grove">{title}</p>
      <div className="mt-4 grid gap-2">
        {rows.length > 0 ? rows.map((row) => (
          <div key={row} className="rounded-2xl bg-cream px-4 py-3 text-sm font-medium text-grove">{row}</div>
        )) : <p className="text-sm text-grove/60">Aucune donnee.</p>}
      </div>
    </article>
  );
}
