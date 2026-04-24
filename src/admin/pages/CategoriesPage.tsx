import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/client';
import type { Category } from '../api/types';
import { ConfirmModal } from '../components/ConfirmModal';
import { DataTable } from '../components/DataTable';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.categories().then(setCategories).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les categories.');
    });
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    await adminApi.deleteCategory(deleteId);
    setCategories((current) => current?.filter((category) => category.id !== deleteId) ?? []);
    setDeleteId(null);
  };

  if (error) return <ErrorState title="Categories indisponibles" description={error} />;
  if (!categories) return <LoadingState label="Chargement des categories..." />;

  return (
    <>
      <PageHeader title="Categories" description="Organisez les produits par familles claires." action={<Link className="btn btn-primary" to="/admin/categories/new"><Plus size={17} /> Ajouter</Link>} />
      <DataTable columns={['Nom', 'Slug', 'Etat', 'Actions']} rows={categories.map((category) => (
        <tr key={category.id} className="hover:bg-leaf-50/45">
          <td className="px-5 py-4 font-semibold">{category.name}</td>
          <td className="px-5 py-4 text-grove/60">{category.slug}</td>
          <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${category.is_active ? 'bg-leaf-50 text-leaf-700' : 'bg-grove/10 text-grove/55'}`}>{category.is_active ? 'Active' : 'Inactive'}</span></td>
          <td className="px-5 py-4">
            <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
              <Link className="inline-grid h-9 w-9 place-items-center rounded-full bg-grove text-cream" to={`/admin/categories/${category.id}/edit`} aria-label="Editer la categorie" title="Editer">
                <Edit size={15} />
              </Link>
              <button className="inline-grid h-9 w-9 place-items-center rounded-full bg-tomato/10 text-tomato" type="button" onClick={() => setDeleteId(category.id)} aria-label="Supprimer la categorie" title="Supprimer">
                <Trash2 size={15} />
              </button>
            </div>
          </td>
        </tr>
      ))} />
      <ConfirmModal isOpen={Boolean(deleteId)} title="Supprimer cette categorie ?" onCancel={() => setDeleteId(null)} onConfirm={confirmDelete} />
    </>
  );
}
