export const parsePrice = (price) => Number(price.replace(',', '.').match(/\d+(\.\d+)?/)?.[0] ?? 0);

const STORE_SETTINGS_CACHE_KEY = 'maison-verde-store-settings';

export const getStoredCurrency = () => {
  try {
    return JSON.parse(window.localStorage.getItem(STORE_SETTINGS_CACHE_KEY) ?? 'null')?.currency ?? 'EUR';
  } catch {
    return 'EUR';
  }
};

export const formatPrice = (value, currency = getStoredCurrency()) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(value);

export const formatUnitPrice = (value, currency = getStoredCurrency()) => `${formatPrice(value, currency)}/kg`;

export const getWeightGrams = (item) => item.quantityGrams ?? (item.quantity ?? 1) * 1000;

export const formatWeight = (grams) => {
  if (grams < 1000) return `${grams} g`;
  const kilos = grams / 1000;
  return `${Number.isInteger(kilos) ? kilos : kilos.toFixed(2).replace('.', ',')} kg`;
};

export const getLineTotal = (item) => Number(item.priceValue ?? parsePrice(item.price)) * (getWeightGrams(item) / 1000);

export const getOrderTotals = (items) => ({
  itemCount: items.length,
  total: items.reduce((sum, item) => sum + getLineTotal(item), 0),
  totalWeight: items.reduce((sum, item) => sum + getWeightGrams(item), 0),
});
