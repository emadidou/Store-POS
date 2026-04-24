import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/client';
import type { StockMovement } from '../api/types';
import { DataTable } from '../components/DataTable';
import { EmptyState } from '../components/EmptyState';
import { adminInputClass, FormField } from '../components/FormField';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { SearchInput } from '../components/SearchInput';
import { StockStatusBadge } from '../components/stock/StockStatusBadge';
import { shortDate } from '../utils/format';

const emptyFilters = {
  search: '',
  type: '',
  source: '',
};

export function StockMovementsPage() {
  const [rows, setRows] = useState<StockMovement[] | null>(null);
  const [filters, setFilters] = useState(emptyFilters);

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      adminApi.stockMovements(filters).then((nextRows) => {
        if (!cancelled) setRows(nextRows);
      });
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [filters]);

  const updateFilter = (key: keyof typeof emptyFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  if (!rows) return <LoadingState label="Chargement des mouvements de stock..." />;

  return (
    <>
      <PageHeader
        title="Mouvements de stock"
        description="Historique des entrees, sorties et corrections pour garder une trace claire des ajustements."
        action={<Link className="btn btn-secondary" to="/admin/stock">Retour stock</Link>}
      />

      <section className="mb-5 grid gap-3 rounded-[1.5rem] border border-grove/10 bg-white p-4 shadow-soft lg:grid-cols-[1.3fr_repeat(2,minmax(180px,1fr))]">
        <FormField label="Recherche">
          <SearchInput value={filters.search} onChange={(value) => updateFilter('search', value)} placeholder="Produit, raison, note..." />
        </FormField>
        <FormField label="Type">
          <select className={adminInputClass} value={filters.type} onChange={(event) => updateFilter('type', event.target.value)}>
            <option value="">Tous</option>
            <option value="in">Entree</option>
            <option value="out">Sortie</option>
            <option value="adjustment">Correction</option>
          </select>
        </FormField>
        <FormField label="Source">
          <select className={adminInputClass} value={filters.source} onChange={(event) => updateFilter('source', event.target.value)}>
            <option value="">Toutes</option>
            <option value="admin">Admin</option>
            <option value="pos">POS</option>
            <option value="online">Online</option>
            <option value="web">Web</option>
          </select>
        </FormField>
      </section>

      {rows.length === 0 ? (
        <EmptyState title="Aucun mouvement trouve" description="Les prochains ajustements de stock apparaitront ici." />
      ) : (
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
      )}
    </>
  );
}
