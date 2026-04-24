import { Download, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../api/client';
import type { PurchaseJournalRow, PurchaseStats, Supplier } from '../api/types';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { adminInputClass, FormField } from '../components/FormField';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { PaginationBar } from '../components/PaginationBar';
import { PurchaseJournal } from '../components/purchases/PurchaseJournal';
import { PurchaseStatsCards } from '../components/purchases/PurchaseStatsCards';

const emptyFilters = {
  supplier_id: '',
  payment_status: '',
  has_attachment: '',
  date_from: '',
  date_to: '',
};

export function PurchaseJournalPage() {
  const [rows, setRows] = useState<PurchaseJournalRow[] | null>(null);
  const [stats, setStats] = useState<PurchaseStats | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.suppliers({ is_active: '1' }).then(setSuppliers).catch(() => undefined);
  }, []);

  useEffect(() => {
    Promise.all([
      adminApi.purchasesJournalPage(appliedFilters, currentPage),
      adminApi.purchaseStats(appliedFilters),
    ])
      .then(([journalPayload, statsPayload]) => {
        setRows(journalPayload.data);
        setCurrentPage(journalPayload.currentPage);
        setLastPage(journalPayload.lastPage);
        setTotal(journalPayload.total);
        setStats(statsPayload);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Impossible de charger le journal achats.');
      });
  }, [appliedFilters, currentPage]);

  const exportPath = useMemo(() => adminApi.purchaseAccountingExportPath({ type: 'all', ...appliedFilters }), [appliedFilters]);

  if (error && !rows) return <ErrorState title="Journal achats indisponible" description={error} />;
  if (!rows || !stats) return <LoadingState label="Chargement du journal achats..." />;

  return (
    <>
      <PageHeader
        title="Journal achats"
        description="Suivi des achats confirmes, TVA recuperable et justificatifs fournisseurs."
        action={<button type="button" className="btn btn-secondary" onClick={() => adminApi.downloadAdminFile(exportPath, 'journal-achats.csv')}><Download size={17} /> Export CSV</button>}
      />
      <div className="mb-5 grid gap-4 rounded-[1.5rem] border border-grove/10 bg-white p-5 shadow-soft lg:grid-cols-5">
        <FormField label="Fournisseur">
          <select className={adminInputClass} value={filters.supplier_id} onChange={(event) => setFilters((current) => ({ ...current, supplier_id: event.target.value }))}>
            <option value="">Tous</option>
            {suppliers.map((supplier) => <option key={supplier.id} value={String(supplier.id)}>{supplier.name}</option>)}
          </select>
        </FormField>
        <FormField label="Paiement">
          <select className={adminInputClass} value={filters.payment_status} onChange={(event) => setFilters((current) => ({ ...current, payment_status: event.target.value }))}>
            <option value="">Tous</option>
            <option value="unpaid">Impayes</option>
            <option value="partial">Partiels</option>
            <option value="paid">Payes</option>
          </select>
        </FormField>
        <FormField label="Facture jointe">
          <select className={adminInputClass} value={filters.has_attachment} onChange={(event) => setFilters((current) => ({ ...current, has_attachment: event.target.value }))}>
            <option value="">Toutes</option>
            <option value="1">Avec piece jointe</option>
            <option value="0">Sans piece jointe</option>
          </select>
        </FormField>
        <FormField label="Du">
          <input className={adminInputClass} type="date" value={filters.date_from} onChange={(event) => setFilters((current) => ({ ...current, date_from: event.target.value }))} />
        </FormField>
        <FormField label="Au">
          <input className={adminInputClass} type="date" value={filters.date_to} onChange={(event) => setFilters((current) => ({ ...current, date_to: event.target.value }))} />
        </FormField>
        <div className="lg:col-span-5 flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" onClick={() => { setCurrentPage(1); setAppliedFilters(filters); }}>Filtrer</button>
          <button type="button" className="btn btn-secondary" onClick={() => { setFilters(emptyFilters); setAppliedFilters(emptyFilters); setCurrentPage(1); }}>
            <RotateCcw size={17} />
            Reinitialiser
          </button>
        </div>
      </div>
      {error && <p className="mb-4 rounded-2xl bg-tomato/10 p-3 text-sm font-semibold text-tomato">{error}</p>}
      <PurchaseStatsCards stats={stats} />
      <div className="mt-6">
        {rows.length === 0 ? <EmptyState title="Aucun achat confirme" description="Confirmez des achats fournisseurs pour alimenter le journal." /> : <PurchaseJournal rows={rows} />}
      </div>
      <PaginationBar currentPage={currentPage} lastPage={lastPage} total={total} onPageChange={setCurrentPage} />
    </>
  );
}
