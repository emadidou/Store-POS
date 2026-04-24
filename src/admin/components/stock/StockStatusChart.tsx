import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { StockStatusPoint } from '../../api/types';

const COLORS: Record<string, string> = {
  in_stock: '#215b3f',
  low_stock: '#d99122',
  out_of_stock: '#d15a4a',
};

export function StockStatusChart({ data }: { data: StockStatusPoint[] }) {
  return (
    <section className="rounded-[1.75rem] border border-grove/10 bg-white p-5 shadow-soft">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-leaf-700">Statut stock</p>
        <h3 className="mt-2 font-display text-2xl font-semibold text-grove">Repartition des produits</h3>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E0D5" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#567060', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: '#567060', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: '#F6F2E8' }} formatter={(value: number) => [`${value} produits`, 'Volume']} />
            <Bar dataKey="value" radius={[14, 14, 0, 0]}>
              {data.map((entry) => <Cell key={entry.key} fill={COLORS[entry.key] ?? COLORS.in_stock} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
