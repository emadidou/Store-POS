import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../api/client';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { SupplierForm, emptySupplierForm, supplierToForm, type SupplierFormState } from '../components/suppliers/SupplierForm';

export function SupplierFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<SupplierFormState>(emptySupplierForm);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    adminApi.supplier(id)
      .then((supplier) => setForm(supplierToForm(supplier)))
      .catch((loadError) => setLoadError(loadError instanceof Error ? loadError.message : 'Impossible de charger le fournisseur.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const update = (key: keyof SupplierFormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Le nom fournisseur est obligatoire.');
      return;
    }

    try {
      await adminApi.saveSupplier({
        ...form,
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        siren: form.siren.trim() || null,
        siret: form.siret.trim() || null,
        vat_number: form.vat_number.trim() || null,
        notes: form.notes.trim() || null,
      }, id);
      navigate('/admin/suppliers');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Impossible d'enregistrer le fournisseur.");
    }
  };

  if (loadError && !isLoading && id) return <ErrorState title="Fournisseur indisponible" description={loadError} />;
  if (isLoading) return <LoadingState label="Chargement du fournisseur..." />;

  return (
    <>
      <PageHeader title={id ? 'Modifier le fournisseur' : 'Ajouter un fournisseur'} description="Conservez les coordonnees, references legales et notes utiles au comptable." />
      <form onSubmit={submit} className="grid max-w-4xl gap-5 rounded-[1.5rem] border border-grove/10 bg-white p-5 shadow-soft">
        <SupplierForm form={form} onChange={update} />
        {error && <p className="rounded-2xl bg-tomato/10 p-3 text-sm font-semibold text-tomato">{error}</p>}
        <button className="btn btn-primary w-max" type="submit"><Save size={17} /> Enregistrer</button>
      </form>
    </>
  );
}
