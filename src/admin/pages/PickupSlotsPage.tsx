import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { adminApi } from '../api/client';
import type { PickupSlot } from '../api/types';
import { ErrorState } from '../components/ErrorState';
import { adminInputClass } from '../components/FormField';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { dayNames, time } from '../utils/format';

const emptySlot = { day_of_week: 1, start_time: '09:30', end_time: '12:30', max_orders: 8, is_active: true };

export function PickupSlotsPage() {
  const [slots, setSlots] = useState<PickupSlot[] | null>(null);
  const [form, setForm] = useState(emptySlot);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.pickupSlots().then(setSlots).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les creneaux.');
    });
  }, []);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      const saved = await adminApi.savePickupSlot(form);
      setSlots((current) => [...(current ?? []), saved]);
      setForm(emptySlot);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Impossible d'enregistrer le creneau.");
    }
  };

  const remove = async (id: number) => {
    setError('');

    try {
      await adminApi.deletePickupSlot(id);
      setSlots((current) => current?.filter((slot) => slot.id !== id) ?? []);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Impossible de supprimer le creneau.');
    }
  };

  if (error && !slots) return <ErrorState title="Creneaux indisponibles" description={error} />;
  if (!slots) return <LoadingState label="Chargement des creneaux..." />;

  return (
    <>
      <PageHeader title="Creneaux de retrait" description="Configurez les plages disponibles pour les retraits en magasin." />
      {error && <p className="mb-4 rounded-2xl bg-tomato/10 p-3 text-sm font-semibold text-tomato">{error}</p>}
      <form onSubmit={save} className="mb-6 grid gap-3 rounded-[1.5rem] border border-grove/10 bg-white p-4 shadow-soft md:grid-cols-6">
        <select className={adminInputClass} value={form.day_of_week} onChange={(event) => setForm({ ...form, day_of_week: Number(event.target.value) })}>{dayNames.map((day, index) => <option key={day} value={index}>{day}</option>)}</select>
        <input className={adminInputClass} type="time" value={form.start_time} onChange={(event) => setForm({ ...form, start_time: event.target.value })} />
        <input className={adminInputClass} type="time" value={form.end_time} onChange={(event) => setForm({ ...form, end_time: event.target.value })} />
        <input className={adminInputClass} type="number" value={form.max_orders} onChange={(event) => setForm({ ...form, max_orders: Number(event.target.value) })} />
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /> Actif</label>
        <button className="btn btn-primary justify-center" type="submit"><Plus size={17} /> Ajouter</button>
      </form>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {slots.map((slot) => (
          <article key={slot.id} className="rounded-[1.5rem] border border-grove/10 bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div><p className="font-display text-xl font-semibold">{dayNames[slot.day_of_week]}</p><p className="mt-1 text-sm text-grove/60">{time(slot.start_time)} - {time(slot.end_time)} - max {slot.max_orders ?? 'illimite'}</p></div>
              <button type="button" className="rounded-full bg-tomato/10 p-2 text-tomato" onClick={() => remove(slot.id)}><Trash2 size={16} /></button>
            </div>
            <span className={`mt-4 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${slot.is_active ? 'bg-leaf-50 text-leaf-700' : 'bg-grove/10 text-grove/55'}`}>{slot.is_active ? 'Actif' : 'Inactif'}</span>
          </article>
        ))}
      </div>
    </>
  );
}
