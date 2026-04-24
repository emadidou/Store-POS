import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CategoryStockPoint } from '../../api/types';

export function StockByCategoryChart({ data }: { data: CategoryStockPoint[] }) {
  return (
    <section className="rounded-[1.75rem] border border-grove/10 bg-white p-5 shadow-soft">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-leaf-700">Par categorie</p>
        <h3 className="mt-2 font-display text-2xl font-semibold text-grove">Stock cumule par famille</h3>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E0D5" vertical={false} />
            <XAxis dataKey="category" tick={{ fill: '#567060', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#567060', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(value: number, _name, item) => [`${value}`, item.dataKey === 'stock_units' ? 'Stock cumule' : 'Valeur']} />
            <Bar dataKey="stock_units" fill="#215b3f" radius={[14, 14, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
