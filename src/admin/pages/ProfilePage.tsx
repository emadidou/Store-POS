import { Save } from 'lucide-react';
import { useState } from 'react';
import { adminApi } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { adminInputClass, FormField } from '../components/FormField';
import { PageHeader } from '../components/PageHeader';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name ?? '', email: user?.email ?? '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setIsSaving(true);

    try {
      const updatedUser = await adminApi.updateProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password.trim() || null,
      });
      updateUser(updatedUser);
      setForm((current) => ({ ...current, password: '' }));
      setMessage('Profil mis a jour.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Mise a jour impossible.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Profil admin" description="Gerez les informations du compte administrateur." />
      <form onSubmit={submit} className="grid max-w-3xl gap-5 rounded-[1.5rem] border border-grove/10 bg-white p-5 shadow-soft">
        <FormField label="Nom"><input className={adminInputClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></FormField>
        <FormField label="Email"><input className={adminInputClass} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></FormField>
        <FormField label="Nouveau mot de passe"><input className={adminInputClass} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></FormField>
        {error && <p className="rounded-2xl bg-tomato/10 p-3 text-sm font-semibold text-tomato">{error}</p>}
        {message && <p className="rounded-2xl bg-leaf-50 p-3 text-sm font-semibold text-leaf-700">{message}</p>}
        <button className="btn btn-primary w-max" type="submit" disabled={isSaving}><Save size={17} /> {isSaving ? 'Mise a jour...' : 'Mettre a jour'}</button>
      </form>
    </>
  );
}
