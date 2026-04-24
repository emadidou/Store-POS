import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { StockStatusPoint } from '../../api/types';

const COLORS = ['#215b3f', '#d99122', '#d15a4a', '#9AA698'];

export function StockDistributionChart({ data }: { data: StockStatusPoint[] }) {
  return (
    <section className="rounded-[1.75rem] border border-grove/10 bg-white p-5 shadow-soft">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-leaf-700">Vue globale</p>
        <h3 className="mt-2 font-display text-2xl font-semibold text-grove">Distribution du stock</h3>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={68} outerRadius={108} paddingAngle={4}>
              {data.map((entry, index) => <Cell key={entry.key} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(value: number) => [`${value} produits`, 'Volume']} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {data.map((item, index) => (
          <span key={item.key} className="inline-flex items-center gap-2 rounded-full bg-cream px-3 py-2 text-xs font-semibold text-grove/75">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            {item.label} · {item.value}
          </span>
        ))}
      </div>
    </section>
  );
}
