export const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const STORE_SETTINGS_CACHE_KEY = 'maison-verde-store-settings';

export function getStoredCurrency() {
  try {
    return JSON.parse(window.localStorage.getItem(STORE_SETTINGS_CACHE_KEY) ?? 'null')?.currency ?? 'EUR';
  } catch {
    return 'EUR';
  }
}

export function money(value: number, currency = getStoredCurrency()) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(value || 0);
}

export function shortDate(value?: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(value));
}

export function time(value?: string | null) {
  return value ? value.slice(0, 5) : '-';
}
