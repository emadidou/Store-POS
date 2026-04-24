import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CriticalStockProduct } from '../../api/types';

export function LowStockChart({ data }: { data: CriticalStockProduct[] }) {
  return (
    <section className="rounded-[1.75rem] border border-grove/10 bg-white p-5 shadow-soft">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-leaf-700">Produits critiques</p>
        <h3 className="mt-2 font-display text-2xl font-semibold text-grove">Top stock le plus faible</h3>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 6, right: 12, left: 12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E0D5" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#567060', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#274435', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(value: number) => [`${value}`, 'Stock']} />
            <Bar dataKey="stock" fill="#D99122" radius={[0, 14, 14, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
