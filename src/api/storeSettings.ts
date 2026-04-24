import { apiGet } from './client';
import type { ApiStoreSettings } from './types';

const defaultStoreSettings: ApiStoreSettings = {
  store_name: 'Maison Verde',
  phone: '+212600000000',
  email: 'contact@maison-verde.test',
  address: 'Adresse du magasin',
  currency: 'EUR',
  timezone: 'Africa/Casablanca',
};
const STORE_SETTINGS_CACHE_KEY = 'maison-verde-store-settings';

function readCachedStoreSettings() {
  try {
    const cached = JSON.parse(window.localStorage.getItem(STORE_SETTINGS_CACHE_KEY) ?? 'null');
    return cached ? { ...defaultStoreSettings, ...cached } : defaultStoreSettings;
  } catch {
    return defaultStoreSettings;
  }
}

function cacheStoreSettings(settings: ApiStoreSettings) {
  window.localStorage.setItem(STORE_SETTINGS_CACHE_KEY, JSON.stringify(settings));
}

export async function getStoreSettings() {
  try {
    const response = await apiGet<{ data: ApiStoreSettings }>('/store-settings');
    cacheStoreSettings(response.data);

    return response.data;
  } catch {
    return readCachedStoreSettings();
  }
}
