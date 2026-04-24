import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/client';
import type { Supplier } from '../api/types';
import { ConfirmModal } from '../components/ConfirmModal';
import { DataTable } from '../components/DataTable';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { FilterBar } from '../components/FilterBar';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { PaginationBar } from '../components/PaginationBar';
import { SearchInput } from '../components/SearchInput';

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.suppliersPage(query ? { search: query } : {}, currentPage)
      .then((payload) => {
        setSuppliers(payload.data);
        setCurrentPage(payload.currentPage);
        setLastPage(payload.lastPage);
        setTotal(payload.total);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les fournisseurs.');
      });
  }, [currentPage, query]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await adminApi.deleteSupplier(deleteId);
      setSuppliers((current) => current?.filter((supplier) => supplier.id !== deleteId) ?? []);
      setDeleteId(null);
      setTotal((current) => Math.max(0, current - 1));
      setError('');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Suppression impossible.');
      setDeleteId(null);
    }
  };

  if (error && !suppliers) return <ErrorState title="Fournisseurs indisponibles" description={error} />;
  if (!suppliers) return <LoadingState label="Chargement des fournisseurs..." />;

  return (
    <>
      <PageHeader
        title="Fournisseurs"
        description="Centralisez les informations fournisseurs et leur statut d'activite."
        action={<Link className="btn btn-primary" to="/admin/suppliers/new"><Plus size={17} /> Ajouter un fournisseur</Link>}
      />
      <FilterBar>
        <SearchInput value={query} onChange={(value) => { setCurrentPage(1); setQuery(value); }} placeholder="Rechercher un fournisseur..." />
      </FilterBar>
      {error && <p className="mb-4 rounded-2xl bg-tomato/10 p-3 text-sm font-semibold text-tomato">{error}</p>}
      {suppliers.length === 0 ? <EmptyState title="Aucun fournisseur" description="Ajoutez vos premiers partenaires d'achat pour tracer les factures fournisseurs." /> : (
        <DataTable
          columns={['Nom', 'Telephone', 'Email', 'SIRET', 'TVA', 'Statut', 'Achats', 'Actions']}
          rows={suppliers.map((supplier) => (
            <tr key={supplier.id} className="hover:bg-leaf-50/45">
              <td className="px-5 py-4 font-semibold">{supplier.name}</td>
              <td className="px-5 py-4">{supplier.phone ?? '-'}</td>
              <td className="px-5 py-4">{supplier.email ?? '-'}</td>
              <td className="px-5 py-4">{supplier.siret ?? '-'}</td>
              <td className="px-5 py-4">{supplier.vat_number ?? '-'}</td>
              <td className="px-5 py-4">{supplier.is_active ? 'Actif' : 'Inactif'}</td>
              <td className="px-5 py-4">{supplier.purchases_count ?? 0}</td>
              <td className="px-5 py-4">
                <div className="flex gap-2">
                  <Link className="inline-grid h-9 w-9 place-items-center rounded-full bg-leaf-50 text-leaf-700" to={`/admin/suppliers/${supplier.id}/edit`}>
                    <Edit size={15} />
                  </Link>
                  <button className="inline-grid h-9 w-9 place-items-center rounded-full bg-tomato/10 text-tomato" type="button" onClick={() => setDeleteId(supplier.id)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        />
      )}
      <PaginationBar currentPage={currentPage} lastPage={lastPage} total={total} onPageChange={setCurrentPage} />
      <ConfirmModal isOpen={Boolean(deleteId)} title="Supprimer ce fournisseur ?" description="La suppression est bloquee s'il existe deja des achats lies." onCancel={() => setDeleteId(null)} onConfirm={confirmDelete} />
    </>
  );
}
