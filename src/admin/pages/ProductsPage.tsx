import { Edit, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/client';
import type { Product } from '../api/types';
import { ConfirmModal } from '../components/ConfirmModal';
import { DataTable } from '../components/DataTable';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { FilterBar } from '../components/FilterBar';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { PaginationBar } from '../components/PaginationBar';
import { SearchInput } from '../components/SearchInput';
import { money } from '../utils/format';

function ProductThumbnail({ product }: { product: Product }) {
  const [hasError, setHasError] = useState(false);

  if (!product.image || hasError) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf-50 text-leaf-700/45">
        <ImageIcon size={18} />
      </div>
    );
  }

  return (
    <img
      src={product.image}
      alt={`Image de ${product.name}`}
      className="h-12 w-12 rounded-2xl object-cover shadow-sm ring-1 ring-grove/10"
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}

export function ProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.productsPage(query ? { search: query } : {}, currentPage)
      .then((payload) => {
        setProducts(payload.data);
        setCurrentPage(payload.currentPage);
        setLastPage(payload.lastPage);
        setTotal(payload.total);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les produits.');
      });
  }, [currentPage, query]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    await adminApi.deleteProduct(deleteId);
    setProducts((current) => current?.filter((product) => product.id !== deleteId) ?? []);
    setTotal((current) => Math.max(0, current - 1));
    setDeleteId(null);
  };

  if (error) return <ErrorState title="Produits indisponibles" description={error} />;
  if (!products) return <LoadingState label="Chargement des produits..." />;

  return (
    <>
      <PageHeader title="Produits" description="Gerez le catalogue, le stock et les produits disponibles." action={<Link className="btn btn-primary" to="/admin/products/new"><Plus size={17} /> Ajouter un produit</Link>} />
      <FilterBar><SearchInput value={query} onChange={(value) => { setCurrentPage(1); setQuery(value); }} placeholder="Rechercher un produit..." /></FilterBar>
      {products.length === 0 ? <EmptyState title="Aucun produit" /> : (
        <DataTable columns={['Produit', 'Categorie', 'Prix', 'Stock', 'Etat', 'Actions']} rows={products.map((product) => (
          <tr key={product.id} className="hover:bg-leaf-50/45">
            <td className="px-5 py-4">
              <div className="flex items-center gap-3">
                <ProductThumbnail product={product} />
                <div><p className="font-semibold">{product.name}</p><p className="text-xs text-grove/50">{product.slug}</p></div>
              </div>
            </td>
            <td className="px-5 py-4">{product.category?.name ?? '-'}</td>
            <td className="px-5 py-4 font-semibold">{money(product.price)}</td>
            <td className="px-5 py-4">{product.stock}</td>
            <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${product.is_available ? 'bg-leaf-50 text-leaf-700' : 'bg-tomato/10 text-tomato'}`}>{product.is_available ? 'Disponible' : 'Indisponible'}</span></td>
            <td className="px-5 py-4">
              <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
                <Link className="inline-grid h-9 w-9 place-items-center rounded-full bg-grove text-cream" to={`/admin/products/${product.id}/edit`} aria-label="Editer le produit" title="Editer">
                  <Edit size={15} />
                </Link>
                <button className="inline-grid h-9 w-9 place-items-center rounded-full bg-tomato/10 text-tomato" type="button" onClick={() => setDeleteId(product.id)} aria-label="Supprimer le produit" title="Supprimer">
                  <Trash2 size={15} />
                </button>
              </div>
            </td>
          </tr>
        ))} />
      )}
      <PaginationBar currentPage={currentPage} lastPage={lastPage} total={total} onPageChange={setCurrentPage} />
      <ConfirmModal isOpen={Boolean(deleteId)} title="Supprimer ce produit ?" description="Cette action retirera le produit du catalogue admin." onCancel={() => setDeleteId(null)} onConfirm={confirmDelete} />
    </>
  );
}
