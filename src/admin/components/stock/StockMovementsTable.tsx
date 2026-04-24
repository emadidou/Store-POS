import type { StockMovement } from '../../api/types';
import { shortDate } from '../../utils/format';
import { DataTable } from '../DataTable';
import { EmptyState } from '../EmptyState';
import { StockStatusBadge } from './StockStatusBadge';

export function StockMovementsTable({ rows }: { rows: StockMovement[] }) {
  if (rows.length === 0) {
    return <EmptyState title="Aucun mouvement trouve" description="Les prochains ajustements de stock apparaitront ici." />;
  }

  return (
    <DataTable
      columns={['Produit', 'Type', 'Quantite', 'Avant', 'Apres', 'Raison', 'Source', 'Date']}
      rows={rows.map((row) => (
        <tr key={row.id} className="hover:bg-leaf-50/45">
          <td className="px-5 py-4">
            <div>
              <p className="font-semibold">{row.product?.name ?? 'Produit supprime'}</p>
              <p className="text-xs text-grove/50">{row.product?.category?.name ?? '-'}</p>
            </div>
          </td>
          <td className="px-5 py-4">
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${row.type === 'in' ? 'bg-leaf-50 text-leaf-700' : row.type === 'out' ? 'bg-amber-100 text-amber-700' : 'bg-grove/10 text-grove'}`}>
              {row.type === 'in' ? 'Entree' : row.type === 'out' ? 'Sortie' : 'Correction'}
            </span>
          </td>
          <td className="px-5 py-4 font-bold">{row.quantity}</td>
          <td className="px-5 py-4">{row.previous_stock}</td>
          <td className="px-5 py-4">
            <div className="flex items-center gap-2">
              <span>{row.new_stock}</span>
              <StockStatusBadge status={row.product?.stock_status} />
            </div>
          </td>
          <td className="px-5 py-4">
            <p className="font-semibold">{row.reason ?? '-'}</p>
            {row.note && <p className="text-xs text-grove/50">{row.note}</p>}
          </td>
          <td className="px-5 py-4">{row.source ?? '-'}</td>
          <td className="px-5 py-4 text-sm text-grove/60">{shortDate(row.created_at)}</td>
        </tr>
      ))}
    />
  );
}
