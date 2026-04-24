import { Download, Filter, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../api/client';
import type { SalesJournalRow } from '../api/types';
import { DataTable } from '../components/DataTable';
import { ErrorState } from '../components/ErrorState';
import { adminInputClass, FormField } from '../components/FormField';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { PaginationBar } from '../components/PaginationBar';
import { money, shortDate } from '../utils/format';

const emptyFilters = {
  date_from: '',
  date_to: '',
  source: '',
  payment_method: '',
  payment_status: '',
  document_type: '',
};

type JournalFilters = typeof emptyFilters;

export function SalesJournalPage() {
  const [rows, setRows] = useState<SalesJournalRow[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<JournalFilters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<JournalFilters>(emptyFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    setError('');
    adminApi.salesJournalPage(appliedFilters, currentPage)
      .then((payload) => {
        setRows(payload.data);
        setCurrentPage(payload.currentPage);
        setLastPage(payload.lastPage);
        setTotal(payload.total);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Impossible de charger le journal de ventes.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [appliedFilters, currentPage]);

  const exportPath = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    return `/admin/sales-journal/export${params.toString() ? `?${params.toString()}` : ''}`;
  }, [appliedFilters]);

  const updateFilter = (key: keyof JournalFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const applyFilters = (event: React.FormEvent) => {
    event.preventDefault();
    setCurrentPage(1);
    setAppliedFilters(filters);
  };

  const resetFilters = () => {
    setFilters(emptyFilters);
    setCurrentPage(1);
    setAppliedFilters(emptyFilters);
  };

  if (error && !rows) return <ErrorState title="Journal de ventes indisponible" description={error} />;
  if (!rows && isLoading) return <LoadingState label="Chargement du journal de ventes..." />;

  return (
    <>
      <PageHeader
        title="Journal de ventes"
        description="Suivi filtre des documents, paiements, montants HT, TVA et TTC."
        action={(
          <button type="button" className="btn btn-secondary" onClick={() => adminApi.downloadAdminFile(exportPath, 'journal-ventes.csv')}>
            <Download size={17} />
            Export CSV
          </button>
        )}
      />
      {error && <p className="mb-4 rounded-2xl bg-tomato/10 p-3 text-sm font-semibold text-tomato">{error}</p>}

      <form onSubmit={applyFilters} className="mb-5 grid gap-4 rounded-[1.5rem] border border-grove/10 bg-white p-5 shadow-soft lg:grid-cols-6">
        <FormField label="Du">
          <input className={adminInputClass} type="date" value={filters.date_from} onChange={(event) => updateFilter('date_from', event.target.value)} />
        </FormField>
        <FormField label="Au">
          <input className={adminInputClass} type="date" value={filters.date_to} onChange={(event) => updateFilter('date_to', event.target.value)} />
        </FormField>
        <FormField label="Source">
          <select className={adminInputClass} value={filters.source} onChange={(event) => updateFilter('source', event.target.value)}>
            <option value="">Toutes</option>
            <option value="pos">POS</option>
            <option value="web">Online</option>
            <option value="admin">Admin</option>
          </select>
        </FormField>
        <FormField label="Paiement">
          <select className={adminInputClass} value={filters.payment_method} onChange={(event) => updateFilter('payment_method', event.target.value)}>
            <option value="">Tous</option>
            <option value="cash">Cash</option>
            <option value="stripe">Carte</option>
            <option value="stripe_later_ready">Reception</option>
          </select>
        </FormField>
        <FormField label="Statut">
          <select className={adminInputClass} value={filters.payment_status} onChange={(event) => updateFilter('payment_status', event.target.value)}>
            <option value="">Tous</option>
            <option value="paid">Paye</option>
            <option value="pending">En attente</option>
            <option value="failed">Echoue</option>
          </select>
        </FormField>
        <FormField label="Document">
          <select className={adminInputClass} value={filters.document_type} onChange={(event) => updateFilter('document_type', event.target.value)}>
            <option value="">Tous</option>
            <option value="invoice">Factures</option>
            <option value="order_voucher">Bons</option>
            <option value="credit_note">Avoirs</option>
          </select>
        </FormField>

        <div className="flex flex-wrap gap-2 lg:col-span-6">
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            <Filter size={17} />
            Filtrer
          </button>
          <button type="button" className="btn btn-secondary" onClick={resetFilters} disabled={isLoading}>
            <RotateCcw size={17} />
            Reinitialiser
          </button>
        </div>
      </form>

      {isLoading ? (
        <LoadingState label="Application des filtres..." />
      ) : rows && rows.length > 0 ? (
        <DataTable
          columns={['Date', 'Document', 'Commande', 'Client', 'HT', 'TVA', 'TTC', 'Paiement', 'Source']}
          rows={rows.map((row) => (
            <tr key={`${row.order_number}-${row.invoice_number ?? row.document_type}`}>
              <td className="px-5 py-4 font-semibold">{shortDate(row.date_document)}</td>
              <td className="px-5 py-4">
                <p className="font-bold">{labelDocument(row.document_type)}</p>
                <p className="text-xs text-grove/55">
                  {row.document_type === 'credit_note' ? (row.credit_note_number ?? '-') : (row.invoice_number ?? '-')}
                </p>
                {row.original_invoice_number && <p className="text-xs text-grove/45">Origine {row.original_invoice_number}</p>}
              </td>
              <td className="px-5 py-4">{row.order_number}</td>
              <td className="px-5 py-4">{row.customer_name ?? '-'}</td>
              <td className="px-5 py-4 font-semibold">{money(row.amount_ht)}</td>
              <td className="px-5 py-4 font-semibold">{money(row.amount_vat)}</td>
              <td className="px-5 py-4 font-black">{money(row.amount_ttc)}</td>
              <td className="px-5 py-4">{row.payment_status}</td>
              <td className="px-5 py-4">{row.source ?? '-'}</td>
            </tr>
          ))}
        />
      ) : (
        <div className="rounded-[1.5rem] border border-grove/10 bg-white p-8 text-center shadow-soft">
          <p className="font-display text-2xl font-semibold text-grove">Aucune vente trouvee</p>
          <p className="mt-2 text-sm text-grove/60">Essayez une autre periode ou retirez certains filtres.</p>
        </div>
      )}
      <PaginationBar currentPage={currentPage} lastPage={lastPage} total={total} onPageChange={setCurrentPage} />
    </>
  );
}

function labelDocument(documentType: string) {
  if (documentType === 'invoice') return 'Facture';
  if (documentType === 'credit_note') return 'Avoir';
  return 'Bon';
}
