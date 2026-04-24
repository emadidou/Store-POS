import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { adminApi } from '../api/client';
import type { StoreSettings } from '../api/types';
import { ErrorState } from '../components/ErrorState';
import { adminInputClass, FormField } from '../components/FormField';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';

const CURRENCY_OPTIONS = [
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'MAD', label: 'Dirham marocain (MAD)' },
  { value: 'USD', label: 'Dollar americain (USD)' },
  { value: 'GBP', label: 'Livre sterling (GBP)' },
  { value: 'CHF', label: 'Franc suisse (CHF)' },
  { value: 'CAD', label: 'Dollar canadien (CAD)' },
];

const TIMEZONE_OPTIONS = [
  { value: 'Africa/Casablanca', label: 'Casablanca (Africa/Casablanca)' },
  { value: 'Europe/Paris', label: 'Paris (Europe/Paris)' },
  { value: 'Europe/Brussels', label: 'Bruxelles (Europe/Brussels)' },
  { value: 'Europe/Luxembourg', label: 'Luxembourg (Europe/Luxembourg)' },
  { value: 'Europe/Geneva', label: 'Geneve (Europe/Geneva)' },
  { value: 'Europe/London', label: 'Londres (Europe/London)' },
  { value: 'UTC', label: 'UTC' },
];

export function StoreSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.storeSettings().then(setSettings).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les parametres.');
    });
  }, []);

  const update = (key: keyof StoreSettings, value: string | number | boolean) => setSettings((current) => current ? { ...current, [key]: value } : current);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    setError('');

    try {
      const updatedSettings = await adminApi.updateStoreSettings(settings);
      setSettings(updatedSettings);
      window.dispatchEvent(new CustomEvent('store-settings-updated', { detail: updatedSettings }));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Impossible d'enregistrer les parametres.");
    } finally {
      setIsSaving(false);
    }
  };

  if (error && !settings) return <ErrorState title="Parametres indisponibles" description={error} />;
  if (!settings) return <LoadingState label="Chargement des parametres..." />;

  const currencyOptions = CURRENCY_OPTIONS.some((option) => option.value === settings.currency)
    ? CURRENCY_OPTIONS
    : [{ value: settings.currency, label: `${settings.currency} (actuelle)` }, ...CURRENCY_OPTIONS];

  const timezoneOptions = TIMEZONE_OPTIONS.some((option) => option.value === settings.timezone)
    ? TIMEZONE_OPTIONS
    : [{ value: settings.timezone, label: `${settings.timezone} (actuel)` }, ...TIMEZONE_OPTIONS];

  return (
    <>
      <PageHeader title="Parametres magasin" description="Informations generales, devise, timezone et delai de preparation." />
      <form onSubmit={save} className="grid gap-5 rounded-[1.5rem] border border-grove/10 bg-white p-5 shadow-soft lg:grid-cols-2">
        <FormField label="Nom du magasin"><input className={adminInputClass} value={settings.store_name} onChange={(event) => update('store_name', event.target.value)} /></FormField>
        <FormField label="Nom societe"><input className={adminInputClass} value={settings.company_name ?? ''} onChange={(event) => update('company_name', event.target.value)} /></FormField>
        <FormField label="Forme juridique"><input className={adminInputClass} value={settings.legal_form ?? ''} onChange={(event) => update('legal_form', event.target.value)} /></FormField>
        <FormField label={`Capital social (${settings.currency || 'EUR'})`}><input className={adminInputClass} type="number" min="0" step="0.01" value={settings.share_capital ?? ''} placeholder="Ex : 10000" onChange={(event) => update('share_capital', event.target.value === '' ? '' : Number(event.target.value))} /></FormField>
        <FormField label="Telephone"><input className={adminInputClass} value={settings.phone} onChange={(event) => update('phone', event.target.value)} /></FormField>
        <FormField label="Email"><input className={adminInputClass} value={settings.email ?? ''} onChange={(event) => update('email', event.target.value)} /></FormField>
        <FormField label="Adresse"><input className={adminInputClass} value={settings.address ?? ''} onChange={(event) => update('address', event.target.value)} /></FormField>
        <FormField label="SIREN"><input className={adminInputClass} value={settings.siren ?? ''} onChange={(event) => update('siren', event.target.value)} /></FormField>
        <FormField label="SIRET"><input className={adminInputClass} value={settings.siret ?? ''} onChange={(event) => update('siret', event.target.value)} /></FormField>
        <FormField label="Code APE / NAF"><input className={adminInputClass} value={settings.ape_code ?? ''} onChange={(event) => update('ape_code', event.target.value)} /></FormField>
        <FormField label="TVA intracommunautaire"><input className={adminInputClass} value={settings.vat_number ?? ''} onChange={(event) => update('vat_number', event.target.value)} /></FormField>
        <FormField label="RC"><input className={adminInputClass} value={settings.rc ?? ''} onChange={(event) => update('rc', event.target.value)} /></FormField>
        <FormField label="Ville RCS"><input className={adminInputClass} value={settings.rcs_city ?? ''} placeholder="Ex : Paris" onChange={(event) => update('rcs_city', event.target.value)} /></FormField>
        <FormField label="ICE"><input className={adminInputClass} value={settings.ice ?? ''} onChange={(event) => update('ice', event.target.value)} /></FormField>
        <FormField label="Taux TVA (%)"><input className={adminInputClass} type="number" step="0.01" value={settings.vat_rate ?? 5.5} onChange={(event) => update('vat_rate', Number(event.target.value))} /></FormField>
        <FormField label="Regime TVA">
          <select className={adminInputClass} value={settings.vat_regime ?? 'standard'} onChange={(event) => update('vat_regime', event.target.value)}>
            <option value="standard">Standard</option>
            <option value="franchise_base">Franchise en base</option>
          </select>
        </FormField>
        <FormField label="Taux TVA par defaut (%)"><input className={adminInputClass} type="number" step="0.01" value={settings.default_vat_rate ?? settings.vat_rate ?? 5.5} onChange={(event) => update('default_vat_rate', Number(event.target.value))} /></FormField>
        <FormField label="Mention legale TVA"><input className={adminInputClass} value={settings.legal_vat_note ?? ''} onChange={(event) => update('legal_vat_note', event.target.value)} /></FormField>
        <label className="flex items-center gap-2 rounded-2xl bg-cream px-4 py-3 text-sm font-semibold text-grove/70">
          <input type="checkbox" checked={Boolean(settings.vat_exempt)} onChange={(event) => update('vat_exempt', event.target.checked)} />
          TVA non applicable, art. 293B du CGI
        </label>
        <FormField label="Devise">
          <select className={adminInputClass} value={settings.currency} onChange={(event) => update('currency', event.target.value)}>
            {currencyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </FormField>
        <FormField label="Timezone">
          <select className={adminInputClass} value={settings.timezone} onChange={(event) => update('timezone', event.target.value)}>
            {timezoneOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </FormField>
        <FormField label="Delai de preparation (minutes)"><input className={adminInputClass} type="number" value={settings.pickup_buffer_minutes} onChange={(event) => update('pickup_buffer_minutes', Number(event.target.value))} /></FormField>
        <FormField label="Message ouvert"><input className={adminInputClass} value={settings.open_message ?? ''} onChange={(event) => update('open_message', event.target.value)} /></FormField>
        <FormField label="Message ferme"><input className={adminInputClass} value={settings.closed_message ?? ''} onChange={(event) => update('closed_message', event.target.value)} /></FormField>
        {error && <p className="rounded-2xl bg-tomato/10 p-3 text-sm font-semibold text-tomato lg:col-span-2">{error}</p>}
        <div className="lg:col-span-2"><button className="btn btn-primary" disabled={isSaving} type="submit"><Save size={17} /> Enregistrer</button></div>
      </form>
    </>
  );
}
