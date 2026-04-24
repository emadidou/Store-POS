import { Apple, Carrot, Salad, ShoppingBasket, Sprout } from 'lucide-react';
import { categories as fallbackCategories } from '../data/siteData.js';
import { ASSET_BASE_URL } from './config';
import { apiGet } from './client';
import type { ApiCategory, ApiCollection, ApiProduct, UiCategory, UiProduct } from './types';
import { formatUnitPrice } from '../utils/order.js';

const fallbackImages = [
  'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?auto=format&fit=crop&w=900&q=80',
];

const productFallbackImages: Record<string, string> = {
  fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=900&q=80',
  legumes: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=900&q=80',
  paniers: 'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?auto=format&fit=crop&w=900&q=80',
};

const categoryIcons = [Apple, Carrot, Sprout, Salad, ShoppingBasket];

function unwrapCollection<T>(response: ApiCollection<T> | T[]): T[] {
  return Array.isArray(response) ? response : response.data;
}

async function fetchAllProducts(path: string) {
  const rows: ApiProduct[] = [];
  let page = 1;

  while (true) {
    const separator = path.includes('?') ? '&' : '?';
    const response = await apiGet<ApiCollection<ApiProduct>>(`${path}${separator}page=${page}`);
    rows.push(...response.data);

    const currentPage = Number((response.meta as { current_page?: number } | undefined)?.current_page ?? page);
    const lastPage = Number((response.meta as { last_page?: number } | undefined)?.last_page ?? currentPage);

    if (currentPage >= lastPage) {
      return rows;
    }

    page += 1;
  }
}

function resolveImage(image: string | null | undefined, categorySlug?: string, index = 0) {
  if (image?.startsWith('http')) return image;
  if (image?.startsWith('/')) return `${ASSET_BASE_URL}${image}`;
  if (image) return `${ASSET_BASE_URL}/storage/${image}`;
  return productFallbackImages[categorySlug ?? ''] ?? fallbackImages[index % fallbackImages.length];
}

export function normalizeProduct(product: ApiProduct, index = 0, currency?: string): UiProduct {
  const categoryName = product.category?.name ?? 'Produit frais';
  const categorySlug = product.category?.slug;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    category: categoryName,
    categorySlug,
    price: formatUnitPrice(product.price, currency),
    priceValue: product.price,
    stock: product.stock,
    badge: product.is_featured ? 'Vedette' : product.stock <= (product.alert_threshold ?? 0) ? 'Stock limite' : 'Frais',
    image: resolveImage(product.image, categorySlug, index),
    is_available: product.is_available,
    is_featured: product.is_featured,
  };
}

export function normalizeCategory(category: ApiCategory, index = 0, products: UiProduct[] = []): UiCategory & { Icon: typeof Apple } {
  const fallback = fallbackCategories[index % fallbackCategories.length];
  const count = products.filter((product) => product.categorySlug === category.slug || product.category === category.name).length;

  return {
    id: category.id,
    title: category.name,
    slug: category.slug,
    count: `${count} produit${count > 1 ? 's' : ''}`,
    description: category.description ?? fallback.description,
    image: fallback.image,
    Icon: categoryIcons[index % categoryIcons.length],
    is_active: category.is_active,
  };
}

export async function getProducts(params: { category?: string; featured?: boolean } = {}, currency?: string) {
  const search = new URLSearchParams();
  search.set('per_page', params.featured ? '6' : '48');
  if (params.category) search.set('category', params.category);
  if (params.featured) search.set('featured', '1');
  const suffix = search.toString() ? `?${search.toString()}` : '';
  const rows = params.featured
    ? unwrapCollection(await apiGet<ApiCollection<ApiProduct>>(`/products${suffix}`))
    : await fetchAllProducts(`/products${suffix}`);

  return rows.map((product, index) => normalizeProduct(product, index, currency)).filter((product) => product.is_available);
}

export async function getFeaturedProducts(currency?: string) {
  return getProducts({ featured: true }, currency);
}

export async function getProductById(id: number | string, currency?: string) {
  const response = await apiGet<{ data: ApiProduct } | ApiProduct>(`/products/${id}`);
  const product = 'data' in response ? response.data : response;
  return normalizeProduct(product, 0, currency);
}

export async function getCategories(products: UiProduct[] = []) {
  const response = await apiGet<ApiCollection<ApiCategory>>('/categories');
  return unwrapCollection(response)
    .filter((category) => category.is_active)
    .map((category, index) => normalizeCategory(category, index, products));
}
