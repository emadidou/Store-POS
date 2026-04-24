import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { adminApi } from '../api/client';
import type { BusinessHour } from '../api/types';
import { adminInputClass } from '../components/FormField';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { dayNames } from '../utils/format';

export function BusinessHoursPage() {
  const [hours, setHours] = useState<BusinessHour[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.businessHours().then(setHours).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les horaires.');
    });
  }, []);

  const update = (index: number, patch: Partial<BusinessHour>) => {
    setHours((current) => current?.map((hour, itemIndex) => itemIndex === index ? { ...hour, ...patch } : hour) ?? []);
  };

  const save = async () => {
    if (!hours) return;
    setIsSaving(true);
    setError('');

    try {
      setHours(await adminApi.updateBusinessHours(hours));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Impossible d'enregistrer les horaires.");
    } finally {
      setIsSaving(false);
    }
  };

  if (error && !hours) return <ErrorState title="Horaires indisponibles" description={error} />;
  if (!hours) return <LoadingState label="Chargement des horaires..." />;

  return (
    <>
      <PageHeader title="Horaires du magasin" description="Definissez les jours ouverts et fermes pour calculer l'etat du magasin." action={<button className="btn btn-primary" type="button" onClick={save} disabled={isSaving}><Save size={17} /> Enregistrer</button>} />
      {error && <p className="mb-4 rounded-2xl bg-tomato/10 p-3 text-sm font-semibold text-tomato">{error}</p>}
      <div className="grid gap-3">
        {hours.map((hour, index) => (
          <article key={hour.day_of_week} className="grid gap-3 rounded-[1.5rem] border border-grove/10 bg-white p-4 shadow-soft md:grid-cols-[1fr_180px_180px_160px] md:items-center">
            <p className="font-display text-xl font-semibold">{dayNames[hour.day_of_week]}</p>
            <input className={adminInputClass} type="time" disabled={hour.is_closed} value={hour.open_time ?? ''} onChange={(event) => update(index, { open_time: event.target.value })} />
            <input className={adminInputClass} type="time" disabled={hour.is_closed} value={hour.close_time ?? ''} onChange={(event) => update(index, { close_time: event.target.value })} />
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={hour.is_closed} onChange={(event) => update(index, { is_closed: event.target.checked })} /> Jour ferme</label>
          </article>
        ))}
      </div>
    </>
  );
}
