import { Leaf } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { adminInputClass, FormField } from '../components/FormField';

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate((location.state as { from?: string } | null)?.from ?? '/admin/dashboard', { replace: true });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Connexion impossible.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#F7F3E9] px-5 py-10 text-grove">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-[2rem] border border-grove/10 bg-white p-6 shadow-soft sm:p-8">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-grove text-cream shadow-soft">
          <Leaf size={24} />
        </span>
        <h1 className="mt-6 font-display text-3xl font-semibold">Connexion admin</h1>
        <p className="mt-2 text-sm leading-6 text-grove/60">Accedez au tableau de bord pour preparer les commandes et gerer le magasin.</p>

        <div className="mt-7 grid gap-4">
          <FormField label="Email">
            <input className={adminInputClass} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </FormField>
          <FormField label="Mot de passe">
            <input className={adminInputClass} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </FormField>
          {error && <p className="rounded-2xl bg-tomato/10 p-3 text-sm font-semibold text-tomato">{error}</p>}
          <button type="submit" className="btn btn-primary justify-center" disabled={isSubmitting}>
            {isSubmitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </div>
      </form>
    </main>
  );
}
