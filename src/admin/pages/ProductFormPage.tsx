import { Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../api/client';
import type { Category } from '../api/types';
import { ErrorState } from '../components/ErrorState';
import { adminInputClass, FormField } from '../components/FormField';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { getStoredCurrency } from '../utils/format';

const emptyProduct = {
  name: '',
  slug: '',
  description: '',
  image: '',
  price: 0,
  stock: 0,
  category_id: '',
  is_available: true,
  is_featured: false,
};

export function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyProduct);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [removeImage, setRemoveImage] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const currency = getStoredCurrency();

  useEffect(() => {
    adminApi.categories().then(setCategories).catch((nextError) => {
      setLoadError(nextError instanceof Error ? nextError.message : 'Impossible de charger les categories.');
    });

    if (id) {
      adminApi.product(id)
        .then((product) => {
          setForm({
            name: product.name,
            slug: product.slug,
            description: product.description ?? '',
            image: product.image ?? '',
            price: product.price,
            stock: product.stock,
            category_id: product.category_id ? String(product.category_id) : '',
            is_available: product.is_available,
            is_featured: product.is_featured,
          });
        })
        .catch((nextError) => {
          setLoadError(nextError instanceof Error ? nextError.message : 'Impossible de charger le produit.');
        })
        .finally(() => {
          setIsLoading(false);
        });

      return;
    }

    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(removeImage ? '' : form.image);
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [form.image, imageFile, removeImage]);

  const update = (key: string, value: string | number | boolean) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!form.name || !form.slug) {
      setError('Le nom et le slug sont obligatoires.');
      return;
    }

    const payload = new FormData();
    payload.append('name', form.name);
    payload.append('slug', form.slug);
    payload.append('description', form.description);
    payload.append('category_id', form.category_id);
    payload.append('price', String(Number(form.price)));
    payload.append('stock', String(Number(form.stock)));
    payload.append('is_available', form.is_available ? '1' : '0');
    payload.append('is_featured', form.is_featured ? '1' : '0');

    if (imageFile) {
      payload.append('image', imageFile);
    }

    if (removeImage) {
      payload.append('remove_image', '1');
    }

    try {
      setIsSaving(true);
      await adminApi.saveProduct(payload, id);
      navigate('/admin/products');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Impossible d'enregistrer le produit.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loadError && !isLoading && id) return <ErrorState title="Produit indisponible" description={loadError} />;
  if (isLoading) return <LoadingState label="Chargement du produit..." />;

  return (
    <>
      <PageHeader title={id ? 'Modifier le produit' : 'Ajouter un produit'} description="Renseignez les informations catalogue, stock et disponibilite." />
      <form onSubmit={submit} className="grid gap-5 rounded-[1.5rem] border border-grove/10 bg-white p-5 shadow-soft lg:grid-cols-2">
        <FormField label="Nom"><input className={adminInputClass} value={form.name} onChange={(event) => update('name', event.target.value)} /></FormField>
        <FormField label="Slug"><input className={adminInputClass} value={form.slug} onChange={(event) => update('slug', event.target.value)} /></FormField>
        <FormField label="Categorie">
          <select className={adminInputClass} value={form.category_id} onChange={(event) => update('category_id', event.target.value)}>
            <option value="">Sans categorie</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </FormField>
        <FormField label="Image produit">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Apercu du produit"
              className="mb-3 h-28 w-28 rounded-3xl object-cover shadow-soft ring-1 ring-grove/10"
            />
          ) : (
            <div className="mb-3 flex h-28 w-28 items-center justify-center rounded-3xl bg-leaf-50 text-xs font-semibold text-grove/45">
              Aucune image
            </div>
          )}
          <input
            className={adminInputClass}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              setImageFile(event.target.files?.[0] ?? null);
              setRemoveImage(false);
            }}
          />
          {form.image && !imageFile && (
            <p className="mt-2 text-xs font-semibold text-grove/60">Image actuelle conservee si aucun nouveau fichier n'est choisi.</p>
          )}
          {imageFile && (
            <p className="mt-2 text-xs font-semibold text-grove/70">Nouvelle image : {imageFile.name}</p>
          )}
          {form.image && !imageFile && (
            <button
              type="button"
              className={`mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${removeImage ? 'bg-tomato text-white' : 'bg-tomato/10 text-tomato hover:bg-tomato/15'}`}
              onClick={() => setRemoveImage((current) => !current)}
            >
              <Trash2 size={14} />
              {removeImage ? 'Image marquee pour suppression' : "Supprimer l'image"}
            </button>
          )}
        </FormField>
        <FormField label={`Prix (${currency})`}><input className={adminInputClass} type="number" step="0.01" value={form.price} onChange={(event) => update('price', Number(event.target.value))} /></FormField>
        <FormField label="Stock"><input className={adminInputClass} type="number" step="0.001" value={form.stock} onChange={(event) => update('stock', Number(event.target.value))} /></FormField>
        <FormField label="Description"><textarea className={`${adminInputClass} min-h-32 lg:col-span-2`} value={form.description} onChange={(event) => update('description', event.target.value)} /></FormField>
        <div className="flex flex-wrap gap-4 lg:col-span-2">
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.is_available} onChange={(event) => update('is_available', event.target.checked)} /> Disponible</label>
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.is_featured} onChange={(event) => update('is_featured', event.target.checked)} /> Produit vedette</label>
        </div>
        {(error || loadError) && <p className="rounded-2xl bg-tomato/10 p-3 text-sm font-semibold text-tomato lg:col-span-2">{error || loadError}</p>}
        <div className="lg:col-span-2">
          <button className="btn btn-primary" type="submit" disabled={isSaving}>
            <Save size={17} />
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </>
  );
}
