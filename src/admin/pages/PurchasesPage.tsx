import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { adminApi } from '../api/client';
import type { Purchase, Supplier } from '../api/types';
import { ConfirmModal } from '../components/ConfirmModal';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { FilterBar } from '../components/FilterBar';
import { adminInputClass, FormField } from '../components/FormField';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { PaginationBar } from '../components/PaginationBar';
import { SearchInput } from '../components/SearchInput';
import { PurchaseList } from '../components/purchases/PurchaseList';

const emptyFilters = {
  supplier_id: '',
  status: '',
  payment_status: '',
  has_attachment: '',
  date_from: '',
  date_to: '',
};

export function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[] | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [actionType, setActionType] = useState<'confirmed' | 'cancelled' | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.suppliers({ is_active: '1' }).then(setSuppliers).catch(() => undefined);
  }, []);

  useEffect(() => {
    adminApi.purchasesPage({
      ...appliedFilters,
      ...(query ? { search: query } : {}),
    }, currentPage)
      .then((payload) => {
        setPurchases(payload.data);
        setCurrentPage(payload.currentPage);
        setLastPage(payload.lastPage);
        setTotal(payload.total);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les achats.');
      });
  }, [appliedFilters, currentPage, query]);

  const confirmTitle = actionType === 'confirmed' ? 'Confirmer cet achat ?' : 'Annuler cet achat ?';
  const confirmDescription = actionType === 'confirmed'
    ? "Le stock sera augmente et des mouvements d'entree seront crees."
    : "Si l'achat etait deja confirme, les mouvements inverses seront tentes sans casser le stock.";

  const handleStatusUpdate = async () => {
    if (!selectedPurchase || !actionType) return;
    try {
      await adminApi.updatePurchaseStatus(selectedPurchase.id, actionType);
      const refreshed = await adminApi.purchasesPage({ ...appliedFilters, ...(query ? { search: query } : {}) }, currentPage);
      setPurchases(refreshed.data);
      setLastPage(refreshed.lastPage);
      setTotal(refreshed.total);
      setSelectedPurchase(null);
      setActionType(null);
      setError('');
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Action impossible.');
      setSelectedPurchase(null);
      setActionType(null);
    }
  };

  const exportPath = useMemo(() => adminApi.purchaseAccountingExportPath(appliedFilters), [appliedFilters]);

  if (error && !purchases) return <ErrorState title="Achats indisponibles" description={error} />;
  if (!purchases) return <LoadingState label="Chargement des achats..." />;

  return (
    <>
      <PageHeader
        title="Achats"
        description="Suivez les achats fournisseurs, les factures externes et les entrees de stock."
        action={(
          <div className="flex flex-wrap gap-2">
            <Link className="btn btn-secondary" to="/admin/purchases/journal">Journal achats</Link>
            <button type="button" className="btn btn-secondary" onClick={() => adminApi.downloadAdminFile(exportPath, 'export-achats.csv')}>Export achats</button>
            <Link className="btn btn-primary" to="/admin/purchases/new"><Plus size={17} /> Nouvel achat</Link>
          </div>
        )}
      />
      <FilterBar>
        <SearchInput value={query} onChange={(value) => { setCurrentPage(1); setQuery(value); }} placeholder="Rechercher un achat..." />
        <FormField label="Fournisseur">
          <select className={adminInputClass} value={filters.supplier_id} onChange={(event) => setFilters((current) => ({ ...current, supplier_id: event.target.value }))}>
            <option value="">Tous</option>
            {suppliers.map((supplier) => <option key={supplier.id} value={String(supplier.id)}>{supplier.name}</option>)}
          </select>
        </FormField>
        <FormField label="Statut">
          <select className={adminInputClass} value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
            <option value="">Tous</option>
            <option value="draft">Brouillons</option>
            <option value="confirmed">Confirmes</option>
            <option value="cancelled">Annules</option>
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
        <button type="button" className="btn btn-primary" onClick={() => { setCurrentPage(1); setAppliedFilters(filters); }}>Filtrer</button>
      </FilterBar>
      {error && <p className="mb-4 rounded-2xl bg-tomato/10 p-3 text-sm font-semibold text-tomato">{error}</p>}
      {purchases.length === 0 ? <EmptyState title="Aucun achat" description="Commencez par enregistrer une facture fournisseur ou un brouillon d'achat." /> : (
        <PurchaseList
          purchases={purchases}
          onConfirm={(purchase) => { setSelectedPurchase(purchase); setActionType('confirmed'); }}
          onCancel={(purchase) => { setSelectedPurchase(purchase); setActionType('cancelled'); }}
          onOpenAttachment={(purchase) => {
            if (purchase.attachment_url) {
              adminApi.openAdminFile(`/admin/purchases/${purchase.id}/attachment`).catch((openError) => setError(openError instanceof Error ? openError.message : 'Ouverture impossible.'));
            }
          }}
        />
      )}
      <PaginationBar currentPage={currentPage} lastPage={lastPage} total={total} onPageChange={setCurrentPage} />
      <ConfirmModal isOpen={Boolean(selectedPurchase && actionType)} title={confirmTitle} description={confirmDescription} onCancel={() => { setSelectedPurchase(null); setActionType(null); }} onConfirm={handleStatusUpdate} />
    </>
  );
}
