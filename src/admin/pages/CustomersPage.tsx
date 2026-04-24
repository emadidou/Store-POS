import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/client';
import type { Customer } from '../api/types';
import { DataTable } from '../components/DataTable';
import { ConfirmModal } from '../components/ConfirmModal';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { FilterBar } from '../components/FilterBar';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { PaginationBar } from '../components/PaginationBar';
import { SearchInput } from '../components/SearchInput';
import { shortDate } from '../utils/format';

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.customersPage(query ? { search: query } : {}, currentPage).then((payload) => {
      setCustomers(payload.data);
      setCurrentPage(payload.currentPage);
      setLastPage(payload.lastPage);
      setTotal(payload.total);
    }).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les clients.');
    });
  }, [currentPage, query]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await adminApi.deleteCustomer(deleteId);
      setCustomers((current) => current?.filter((customer) => customer.id !== deleteId) ?? []);
      setTotal((current) => Math.max(0, current - 1));
      setDeleteId(null);
      setError('');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Suppression impossible.');
      setDeleteId(null);
    }
  };

  if (error && !customers) return <ErrorState title="Clients indisponibles" description={error} />;
  if (!customers) return <LoadingState label="Chargement des clients..." />;

  return (
    <>
      <PageHeader title="Clients" description="Retrouvez les informations clients et l'historique de commandes." action={<Link className="btn btn-primary" to="/admin/customers/new"><Plus size={17} /> Ajouter un client</Link>} />
      <FilterBar><SearchInput value={query} onChange={(value) => { setCurrentPage(1); setQuery(value); }} placeholder="Rechercher un client..." /></FilterBar>
      {error && <p className="mb-4 rounded-2xl bg-tomato/10 p-3 text-sm font-semibold text-tomato">{error}</p>}
      {customers.length === 0 ? <EmptyState title="Aucun client" /> : (
        <DataTable columns={['Nom', 'Telephone', 'Email', 'Commandes', 'Derniere commande', 'Action']} rows={customers.map((customer) => (
          <tr key={customer.id} className="hover:bg-leaf-50/45">
            <td className="px-5 py-4 font-semibold">{customer.full_name}</td>
            <td className="px-5 py-4">{customer.phone}</td>
            <td className="px-5 py-4 text-grove/60">{customer.email ?? '-'}</td>
            <td className="px-5 py-4">{customer.orders_count}</td>
            <td className="px-5 py-4">{shortDate(customer.last_order_at)}</td>
            <td className="px-5 py-4">
              <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
                <Link className="inline-grid h-9 w-9 place-items-center rounded-full bg-grove text-cream" to={`/admin/customers/${customer.id}`} aria-label="Voir le client" title="Voir">
                  <Eye size={15} />
                </Link>
                <Link className="inline-grid h-9 w-9 place-items-center rounded-full bg-leaf-50 text-leaf-700" to={`/admin/customers/${customer.id}/edit`} aria-label="Editer le client" title="Editer">
                  <Edit size={15} />
                </Link>
                <button className="inline-grid h-9 w-9 place-items-center rounded-full bg-tomato/10 text-tomato" type="button" onClick={() => setDeleteId(customer.id)} aria-label="Supprimer le client" title="Supprimer">
                  <Trash2 size={15} />
                </button>
              </div>
            </td>
          </tr>
        ))} />
      )}
      <PaginationBar currentPage={currentPage} lastPage={lastPage} total={total} onPageChange={setCurrentPage} />
      <ConfirmModal isOpen={Boolean(deleteId)} title="Supprimer ce client ?" description="La suppression est bloquee si le client possede deja des commandes." onCancel={() => setDeleteId(null)} onConfirm={confirmDelete} />
    </>
  );
}
