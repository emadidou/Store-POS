import type { PurchaseItem } from '../../api/types';
import { money } from '../../utils/format';

export function computePurchaseTotals(items: Array<Pick<PurchaseItem, 'quantity' | 'unit_cost_ht' | 'vat_rate'>>) {
  return items.reduce((totals, item) => {
    const quantity = Number(item.quantity || 0);
    const unitCostHt = Number(item.unit_cost_ht || 0);
    const vatRate = Number(item.vat_rate || 0);
    const subtotalHt = quantity * unitCostHt;
    const vatAmount = subtotalHt * (vatRate / 100);
    const subtotalTtc = subtotalHt + vatAmount;

    return {
      subtotal_ht: totals.subtotal_ht + subtotalHt,
      total_vat: totals.total_vat + vatAmount,
      total_ttc: totals.total_ttc + subtotalTtc,
    };
  }, { subtotal_ht: 0, total_vat: 0, total_ttc: 0 });
}

export function PurchaseSummary({
  subtotalHt,
  totalVat,
  totalTtc,
}: {
  subtotalHt: number;
  totalVat: number;
  totalTtc: number;
}) {
  return (
    <section className="rounded-3xl border border-grove/10 bg-white p-5 shadow-soft">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-grove/45">Totaux</p>
      <div className="mt-4 grid gap-3">
        <SummaryLine label="Total HT" value={money(subtotalHt)} />
        <SummaryLine label="TVA" value={money(totalVat)} />
        <SummaryLine label="Total TTC" value={money(totalTtc)} highlight />
      </div>
    </section>
  );
}

function SummaryLine({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-2xl px-4 py-3 ${highlight ? 'bg-leaf-50 text-grove' : 'bg-cream text-grove/75'}`}>
      <span className="text-sm font-semibold">{label}</span>
      <strong className={highlight ? 'font-display text-xl font-bold' : 'font-semibold'}>{value}</strong>
    </div>
  );
}
