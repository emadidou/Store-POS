import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { StockMovementSummaryPoint } from '../../api/types';

export function StockMovementsChart({ data }: { data: StockMovementSummaryPoint[] }) {
  return (
    <section className="rounded-[1.75rem] border border-grove/10 bg-white p-5 shadow-soft">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-leaf-700">Mouvements recents</p>
        <h3 className="mt-2 font-display text-2xl font-semibold text-grove">Entrees et sorties sur 7 jours</h3>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E0D5" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#567060', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#567060', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="in" stroke="#215b3f" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="out" stroke="#D99122" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="adjustment" stroke="#567060" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
