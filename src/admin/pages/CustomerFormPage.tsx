import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../api/client';
import { ErrorState } from '../components/ErrorState';
import { adminInputClass, FormField } from '../components/FormField';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';

const emptyCustomer = {
  full_name: '',
  phone: '',
  email: '',
};

export function CustomerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyCustomer);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    adminApi.customer(id)
      .then((customer) => {
        setForm({
          full_name: customer.full_name,
          phone: customer.phone,
          email: customer.email ?? '',
        });
      })
      .catch((loadError) => {
        setLoadError(loadError instanceof Error ? loadError.message : 'Impossible de charger le client.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  const update = (key: keyof typeof emptyCustomer, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!form.full_name.trim() || !form.phone.trim()) {
      setError('Le nom et le telephone sont obligatoires.');
      return;
    }

    try {
      await adminApi.saveCustomer({
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
      }, id);
      navigate('/admin/customers');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Impossible d'enregistrer le client.");
    }
  };

  if (loadError && !isLoading && id) return <ErrorState title="Client indisponible" description={loadError} />;
  if (isLoading) return <LoadingState label="Chargement du client..." />;

  return (
    <>
      <PageHeader title={id ? 'Modifier le client' : 'Ajouter un client'} description="Gerez les informations client utilisees pour les commandes." />
      <form onSubmit={submit} className="grid max-w-3xl gap-5 rounded-[1.5rem] border border-grove/10 bg-white p-5 shadow-soft">
        <FormField label="Nom complet"><input className={adminInputClass} value={form.full_name} onChange={(event) => update('full_name', event.target.value)} /></FormField>
        <FormField label="Telephone"><input className={adminInputClass} value={form.phone} onChange={(event) => update('phone', event.target.value)} /></FormField>
        <FormField label="Email"><input className={adminInputClass} type="email" value={form.email} onChange={(event) => update('email', event.target.value)} /></FormField>
        {error && <p className="rounded-2xl bg-tomato/10 p-3 text-sm font-semibold text-tomato">{error}</p>}
        <button className="btn btn-primary w-max" type="submit"><Save size={17} /> Enregistrer</button>
      </form>
    </>
  );
}
