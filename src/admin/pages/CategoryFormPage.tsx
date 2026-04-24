import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../api/client';
import type { Category } from '../api/types';
import { ErrorState } from '../components/ErrorState';
import { adminInputClass, FormField } from '../components/FormField';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';

export function CategoryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', slug: '', description: '', is_active: true });
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      adminApi.category(id)
        .then((category) => {
          setForm({ name: category.name, slug: category.slug, description: category.description ?? '', is_active: category.is_active });
        })
        .catch((loadError) => {
          setLoadError(loadError instanceof Error ? loadError.message : 'Impossible de charger la categorie.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      await adminApi.saveCategory(form as Partial<Category>, id);
      navigate('/admin/categories');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Impossible d'enregistrer la categorie.");
    }
  };

  if (loadError) return <ErrorState title="Categorie indisponible" description={loadError} />;
  if (isLoading) return <LoadingState label="Chargement de la categorie..." />;

  return (
    <>
      <PageHeader title={id ? 'Modifier la categorie' : 'Ajouter une categorie'} />
      <form onSubmit={submit} className="grid max-w-3xl gap-5 rounded-[1.5rem] border border-grove/10 bg-white p-5 shadow-soft">
        <FormField label="Nom"><input className={adminInputClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></FormField>
        <FormField label="Slug"><input className={adminInputClass} value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} /></FormField>
        <FormField label="Description"><textarea className={`${adminInputClass} min-h-28`} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></FormField>
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /> Active</label>
        {error && <p className="rounded-2xl bg-tomato/10 p-3 text-sm font-semibold text-tomato">{error}</p>}
        <button className="btn btn-primary w-max" type="submit"><Save size={17} /> Enregistrer</button>
      </form>
    </>
  );
}
