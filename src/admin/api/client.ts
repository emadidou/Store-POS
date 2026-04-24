import { mockBusinessHours, mockCategories, mockCustomers, mockOrders, mockPickupSlots, mockProducts, mockStockMovements, mockStoreSettings, mockStoreStatus } from './mockData';
import type { BusinessHour, Category, CategoryStockPoint, CriticalStockProduct, Customer, Order, OrderStatus, PaginatedResult, PickupSlot, Product, Purchase, PurchaseJournalRow, PurchaseStats, SalesJournalRow, StockMovement, StockMovementSummaryPoint, StockStats, StoreSettings, StoreStatus, Supplier } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';
const TOKEN_KEY = 'maison-verde-admin-token';
const STORE_SETTINGS_CACHE_KEY = 'maison-verde-store-settings';
const ENABLE_ADMIN_MOCKS = import.meta.env.DEV && import.meta.env.VITE_ENABLE_ADMIN_MOCKS === 'true';

type RequestOptions = RequestInit & {
  auth?: boolean;
};

type CollectionPayload<T> = {
  data: T[];
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  } | null;
};

export function getAdminToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload && !Array.isArray(payload)) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

async function requestJson(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.auth !== false) {
    const token = getAdminToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && options.auth !== false) {
      clearAdminToken();
      window.dispatchEvent(new Event('admin-auth-expired'));
    }

    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message ?? 'Erreur API');
  }

  if (response.status === 204) {
    return undefined;
  }

  return response.json();
}

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return unwrapData<T>(await requestJson(path, options));
}

async function withFallback<T>(request: () => Promise<T>, fallback: () => T | Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (ENABLE_ADMIN_MOCKS) {
      return fallback();
    }

    throw error;
  }
}

function readCachedStoreSettings(): StoreSettings {
  try {
    const cached = JSON.parse(window.localStorage.getItem(STORE_SETTINGS_CACHE_KEY) ?? 'null');
    return cached ? { ...mockStoreSettings, ...cached } : mockStoreSettings;
  } catch {
    return mockStoreSettings;
  }
}

function cacheStoreSettings(settings: StoreSettings) {
  window.localStorage.setItem(STORE_SETTINGS_CACHE_KEY, JSON.stringify(settings));
}

function queryString(filters: Record<string, string | number | null | undefined> = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      params.set(key, String(value));
    }
  });

  return params.toString() ? `?${params.toString()}` : '';
}

function appendFormValue(formData: FormData, key: string, value: unknown) {
  if (value === null || value === undefined || value === '') return;

  if (typeof value === 'boolean') {
    formData.append(key, value ? '1' : '0');
    return;
  }

  formData.append(key, value instanceof File ? value : String(value));
}

function buildPurchaseFormData(payload: Record<string, unknown>) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === 'items' || key === 'attachment') {
      return;
    }

    appendFormValue(formData, key, value);
  });

  const attachment = payload.attachment;
  if (attachment instanceof File) {
    formData.append('attachment', attachment);
  }

  const items = Array.isArray(payload.items) ? payload.items as Array<Record<string, unknown>> : [];
  items.forEach((item, index) => {
    Object.entries(item).forEach(([key, value]) => {
      appendFormValue(formData, `items[${index}][${key}]`, value);
    });
  });

  return formData;
}

function extractCollection<T>(payload: unknown): CollectionPayload<T> {
  if (Array.isArray(payload)) {
    return { data: payload };
  }

  if (payload && typeof payload === 'object' && 'data' in payload && Array.isArray((payload as { data: unknown[] }).data)) {
    const collection = payload as CollectionPayload<T>;
    return {
      data: collection.data,
      meta: collection.meta ?? null,
    };
  }

  throw new Error('Format de collection inattendu.');
}

function toPaginatedResult<T>(collection: CollectionPayload<T>, fallbackPage = 1, fallbackPerPage?: number): PaginatedResult<T> {
  return {
    data: collection.data,
    currentPage: Number(collection.meta?.current_page ?? fallbackPage),
    lastPage: Number(collection.meta?.last_page ?? fallbackPage),
    perPage: Number(collection.meta?.per_page ?? fallbackPerPage ?? collection.data.length),
    total: Number((collection.meta as { total?: number } | null)?.total ?? collection.data.length),
  };
}

async function fetchCollectionPage<T>(path: string, filters: Record<string, string> = {}, page = 1, perPage = 25): Promise<PaginatedResult<T>> {
  const payload = await requestJson(`${path}${queryString({ ...filters, per_page: perPage, page })}`);
  const collection = extractCollection<T>(payload);
  return toPaginatedResult(collection, page, perPage);
}

function paginateRows<T>(rows: T[], page = 1, perPage = 25): PaginatedResult<T> {
  const safePage = Math.max(1, page);
  const total = rows.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const offset = (safePage - 1) * perPage;

  return {
    data: rows.slice(offset, offset + perPage),
    currentPage: safePage,
    lastPage,
    perPage,
    total,
  };
}

async function fetchAllCollection<T>(path: string, filters: Record<string, string> = {}, perPage = 100): Promise<T[]> {
  const rows: T[] = [];
  let page = 1;

  while (true) {
    const payload = await requestJson(`${path}${queryString({ ...filters, per_page: perPage, page })}`);
    const collection = extractCollection<T>(payload);
    rows.push(...collection.data);

    const currentPage = Number(collection.meta?.current_page ?? page);
    const lastPage = Number(collection.meta?.last_page ?? currentPage);

    if (currentPage >= lastPage) {
      return rows;
    }

    page += 1;
  }
}

function filterMockOrders(orders: Order[], filters: Record<string, string> = {}) {
  const search = (filters.search ?? '').toLowerCase().trim();

  return orders
    .filter((order) => {
      const text = `${order.order_number} ${order.invoice_number ?? ''} ${order.customer.full_name} ${order.customer.phone} ${order.customer.email ?? ''}`.toLowerCase();
      const createdAt = (order.created_at ?? '').slice(0, 10);

      return (!search || text.includes(search))
        && (!filters.status || order.status === filters.status)
        && (!filters.payment_status || order.payment_status === filters.payment_status)
        && (!filters.payment_method || order.payment_method === filters.payment_method)
        && (!filters.source || order.source === filters.source)
        && (!filters.order_type || order.order_type === filters.order_type)
        && (!filters.document_type || order.document_type === filters.document_type)
        && (!filters.date_from || createdAt >= filters.date_from)
        && (!filters.date_to || createdAt <= filters.date_to)
        && (!filters.pickup_date || order.pickup_date === filters.pickup_date);
    })
    .sort((first, second) => sortOrders(first, second, filters.sort));
}

function filterMockProducts(products: Product[], filters: Record<string, string> = {}) {
  const search = (filters.search ?? '').toLowerCase().trim();

  return products.filter((product) => {
    const text = `${product.name} ${product.slug} ${product.category?.name ?? ''}`.toLowerCase();
    const status = product.stock <= 0 ? 'out_of_stock' : product.stock <= (product.alert_threshold ?? 0) ? 'low_stock' : 'in_stock';

    return (!search || text.includes(search))
      && (!filters.status || status === filters.status)
      && (!filters.availability || (filters.availability === 'available' ? product.is_available : !product.is_available))
      && (!filters.category_id || String(product.category_id ?? '') === filters.category_id);
  });
}

function filterMockStockMovements(movements: StockMovement[], filters: Record<string, string> = {}) {
  const search = (filters.search ?? '').toLowerCase().trim();

  return movements.filter((movement) => {
    const text = `${movement.product?.name ?? ''} ${movement.reason ?? ''} ${movement.note ?? ''}`.toLowerCase();
    return (!search || text.includes(search))
      && (!filters.type || movement.type === filters.type)
      && (!filters.source || movement.source === filters.source);
  });
}

function stockStatusOf(product: Product) {
  return product.stock <= 0 ? 'out_of_stock' : product.stock <= (product.alert_threshold ?? 0) ? 'low_stock' : 'in_stock';
}

function buildMockStockStats(days = 7): StockStats {
  const totalProducts = mockProducts.length;
  const inStockProducts = mockProducts.filter((product) => stockStatusOf(product) === 'in_stock').length;
  const lowStockProducts = mockProducts.filter((product) => stockStatusOf(product) === 'low_stock').length;
  const outOfStockProducts = mockProducts.filter((product) => stockStatusOf(product) === 'out_of_stock').length;
  const availableProducts = mockProducts.filter((product) => product.is_available).length;
  const unavailableProducts = mockProducts.filter((product) => !product.is_available).length;
  const stockUnitsTotal = mockProducts.reduce((total, product) => total + product.stock, 0);
  const stockValueTotal = mockProducts.reduce((total, product) => total + (product.stock * product.price), 0);

  const criticalProducts: CriticalStockProduct[] = [...mockProducts]
    .filter((product) => stockStatusOf(product) !== 'in_stock')
    .sort((first, second) => first.stock - second.stock)
    .slice(0, 5)
    .map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category?.name ?? 'Sans categorie',
      stock: product.stock,
      alert_threshold: product.alert_threshold ?? 0,
      status: stockStatusOf(product),
    }));

  const categoryStock = Object.values(mockProducts.reduce<Record<string, CategoryStockPoint>>((accumulator, product) => {
    const key = product.category?.name ?? 'Sans categorie';
    accumulator[key] ??= { category: key, stock_units: 0, stock_value: 0, products_count: 0 };
    accumulator[key].stock_units += product.stock;
    accumulator[key].stock_value += product.stock * product.price;
    accumulator[key].products_count += 1;
    return accumulator;
  }, {})).sort((first, second) => second.stock_units - first.stock_units);

  const dailyMap = new Map<string, StockMovementSummaryPoint>();
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - (days - 1));

  for (let offset = 0; offset < days; offset += 1) {
    const current = new Date(start);
    current.setDate(start.getDate() + offset);
    const date = current.toISOString().slice(0, 10);
    dailyMap.set(date, {
      date,
      label: new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(current),
      in: 0,
      out: 0,
      adjustment: 0,
    });
  }

  mockStockMovements.forEach((movement) => {
    const date = movement.created_at?.slice(0, 10);
    if (!date || !dailyMap.has(date)) return;
    const point = dailyMap.get(date)!;
    point[movement.type as 'in' | 'out' | 'adjustment'] += movement.quantity;
  });

  return {
    totals: {
      total_products: totalProducts,
      in_stock_products: inStockProducts,
      low_stock_products: lowStockProducts,
      out_of_stock_products: outOfStockProducts,
      available_products: availableProducts,
      unavailable_products: unavailableProducts,
      stock_units_total: stockUnitsTotal,
      stock_value_total: stockValueTotal,
    },
    status_distribution: [
      { key: 'in_stock', label: 'En stock', value: inStockProducts },
      { key: 'low_stock', label: 'Stock faible', value: lowStockProducts },
      { key: 'out_of_stock', label: 'Rupture', value: outOfStockProducts },
    ],
    availability_distribution: [
      { key: 'available', label: 'Disponibles', value: availableProducts },
      { key: 'unavailable', label: 'Indisponibles', value: unavailableProducts },
    ],
    critical_products: criticalProducts,
    category_stock: categoryStock,
    recent_movements: [...dailyMap.values()],
  };
}

function sortOrders(first: Order, second: Order, sort = 'newest') {
  if (sort === 'oldest') return dateValue(first.created_at) - dateValue(second.created_at);
  if (sort === 'pickup_asc') return `${first.pickup_date} ${first.pickup_time}`.localeCompare(`${second.pickup_date} ${second.pickup_time}`);
  if (sort === 'pickup_desc') return `${second.pickup_date} ${second.pickup_time}`.localeCompare(`${first.pickup_date} ${first.pickup_time}`);
  if (sort === 'total_asc') return first.total_amount - second.total_amount;
  if (sort === 'total_desc') return second.total_amount - first.total_amount;

  return dateValue(second.created_at) - dateValue(first.created_at);
}

function dateValue(value?: string) {
  return value ? new Date(value).getTime() : 0;
}

export const adminApi = {
  login(email: string, password: string) {
    return apiRequest<{ token: string; admin: { id: number; name: string; email: string } }>('/admin/login', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, password, device_name: 'admin-panel' }),
    });
  },
  me: () => apiRequest<{ id: number; name: string; email: string }>('/admin/me'),
  updateProfile: (payload: { name: string; email: string; password?: string | null }) => apiRequest<{ id: number; name: string; email: string }>('/admin/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }),
  logout: () => apiRequest('/admin/logout', { method: 'POST' }),
  storeStatus: () => withFallback<StoreStatus>(() => apiRequest('/store-status', { auth: false }), () => mockStoreStatus),
  orders: (filters: Record<string, string> = {}) => withFallback<Order[]>(() => fetchAllCollection('/admin/orders', filters), () => filterMockOrders(mockOrders, filters)),
  ordersPage: (filters: Record<string, string> = {}, page = 1, perPage = 25) => withFallback<PaginatedResult<Order>>(
    () => fetchCollectionPage('/admin/orders', filters, page, perPage),
    () => paginateRows(filterMockOrders(mockOrders, filters), page, perPage),
  ),
  order: (id: string | number) => withFallback<Order>(() => apiRequest(`/admin/orders/${id}`), () => mockOrders.find((order) => order.id === Number(id)) ?? mockOrders[0]),
  orderCreditNotes: (id: string | number) => withFallback<Order[]>(() => apiRequest(`/admin/orders/${id}/credit-note`), () => []),
  createCreditNote: (id: string | number, payload: { reason: string; mode: 'full' | 'partial'; restore_stock: boolean; items?: Array<{ product_id: number; quantity: number }> }) => apiRequest<Order>(`/admin/orders/${id}/credit-note`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  creditNotesPage: (filters: Record<string, string> = {}, page = 1, perPage = 25) => withFallback<PaginatedResult<Order>>(
    () => fetchCollectionPage('/admin/credit-notes', filters, page, perPage),
    () => paginateRows([], page, perPage),
  ),
  saveOrder: (payload: Record<string, unknown>, id?: string | number) => apiRequest<Order>(id ? `/admin/orders/${id}` : '/admin/orders', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) }),
  updateOrderStatus: (id: string | number, status: OrderStatus) => apiRequest<Order>(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteOrder: (id: string | number) => apiRequest(`/admin/orders/${id}`, { method: 'DELETE' }),
  products: (filters: Record<string, string> = {}) => withFallback<Product[]>(() => fetchAllCollection('/admin/products', filters), () => filterMockProducts(mockProducts, filters)),
  productsPage: (filters: Record<string, string> = {}, page = 1, perPage = 25) => withFallback<PaginatedResult<Product>>(
    () => fetchCollectionPage('/admin/products', filters, page, perPage),
    () => paginateRows(filterMockProducts(mockProducts, filters), page, perPage),
  ),
  product: (id: string | number) => withFallback<Product>(() => apiRequest(`/admin/products/${id}`), () => mockProducts.find((product) => product.id === Number(id)) ?? mockProducts[0]),
  saveProduct: (payload: Partial<Product> | FormData, id?: string | number) => {
    const isFormData = payload instanceof FormData;

    if (isFormData && id) {
      payload.set('_method', 'PUT');
    }

    return apiRequest<Product>(id ? `/admin/products/${id}` : '/admin/products', {
      method: isFormData ? 'POST' : id ? 'PUT' : 'POST',
      body: isFormData ? payload : JSON.stringify(payload),
    });
  },
  deleteProduct: (id: string | number) => apiRequest(`/admin/products/${id}`, { method: 'DELETE' }),
  stock: (filters: Record<string, string> = {}) => withFallback<Product[]>(() => fetchAllCollection('/admin/stock', filters), () => filterMockProducts(mockProducts, filters)),
  stockAlerts: () => withFallback<{ out_of_stock: number; low_stock: number }>(() => apiRequest('/admin/stock/alerts'), () => ({
    out_of_stock: mockProducts.filter((product) => product.stock <= 0).length,
    low_stock: mockProducts.filter((product) => product.stock > 0 && product.stock <= (product.alert_threshold ?? 0)).length,
  })),
  stockStats: () => withFallback<StockStats>(() => apiRequest('/admin/stock/stats'), () => buildMockStockStats()),
  stockMovements: (filters: Record<string, string> = {}) => withFallback<StockMovement[]>(() => fetchAllCollection('/admin/stock/movements', filters), () => filterMockStockMovements(mockStockMovements, filters)),
  stockMovementsSummary: (days = 7) => withFallback<StockMovementSummaryPoint[]>(() => apiRequest(`/admin/stock/movements-summary${queryString({ days })}`), () => buildMockStockStats(days).recent_movements),
  updateProductStock: (id: string | number, payload: { stock?: number; alert_threshold?: number; is_available?: boolean; reason?: string; note?: string }) => apiRequest<Product>(`/admin/products/${id}/stock`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }),
  adjustStock: (payload: { product_id: number; type: 'in' | 'out' | 'adjustment'; quantity: number; reason?: string; source?: string; note?: string }) => apiRequest<Product>('/admin/stock/adjust', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  categories: () => withFallback<Category[]>(() => apiRequest('/admin/categories'), () => mockCategories),
  category: (id: string | number) => withFallback<Category>(() => apiRequest(`/admin/categories/${id}`), () => mockCategories.find((category) => category.id === Number(id)) ?? mockCategories[0]),
  saveCategory: (payload: Partial<Category>, id?: string | number) => apiRequest<Category>(id ? `/admin/categories/${id}` : '/admin/categories', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) }),
  deleteCategory: (id: string | number) => apiRequest(`/admin/categories/${id}`, { method: 'DELETE' }),
  customers: (filters: Record<string, string> = {}) => withFallback<Customer[]>(() => fetchAllCollection('/admin/customers', filters), () => mockCustomers),
  customersPage: (filters: Record<string, string> = {}, page = 1, perPage = 25) => withFallback<PaginatedResult<Customer>>(
    () => fetchCollectionPage('/admin/customers', filters, page, perPage),
    () => paginateRows(mockCustomers.filter((customer) => {
      const search = (filters.search ?? '').toLowerCase().trim();
      const text = `${customer.full_name} ${customer.phone} ${customer.email ?? ''}`.toLowerCase();
      return !search || text.includes(search);
    }), page, perPage),
  ),
  customer: (id: string | number) => withFallback<Customer>(() => apiRequest(`/admin/customers/${id}`), () => mockCustomers.find((customer) => customer.id === Number(id)) ?? mockCustomers[0]),
  saveCustomer: (payload: Partial<Customer>, id?: string | number) => apiRequest<Customer>(id ? `/admin/customers/${id}` : '/admin/customers', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) }),
  deleteCustomer: (id: string | number) => apiRequest(`/admin/customers/${id}`, { method: 'DELETE' }),
  suppliersPage: (filters: Record<string, string> = {}, page = 1, perPage = 25) => fetchCollectionPage('/admin/suppliers', filters, page, perPage),
  suppliers: (filters: Record<string, string> = {}) => fetchAllCollection('/admin/suppliers', filters),
  supplier: (id: string | number) => apiRequest<Supplier>(`/admin/suppliers/${id}`),
  saveSupplier: (payload: Partial<Supplier>, id?: string | number) => apiRequest<Supplier>(id ? `/admin/suppliers/${id}` : '/admin/suppliers', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) }),
  deleteSupplier: (id: string | number) => apiRequest(`/admin/suppliers/${id}`, { method: 'DELETE' }),
  purchasesPage: (filters: Record<string, string> = {}, page = 1, perPage = 25) => fetchCollectionPage('/admin/purchases', filters, page, perPage),
  purchase: (id: string | number) => apiRequest<Purchase>(`/admin/purchases/${id}`),
  savePurchase: (payload: Record<string, unknown>, id?: string | number) => apiRequest<Purchase>(id ? `/admin/purchases/${id}` : '/admin/purchases', {
    method: 'POST',
    body: (() => {
      const formData = buildPurchaseFormData(payload);
      if (id) formData.append('_method', 'PUT');
      return formData;
    })(),
  }),
  updatePurchaseStatus: (id: string | number, status: 'confirmed' | 'cancelled') => apiRequest<Purchase>(`/admin/purchases/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  deletePurchase: (id: string | number) => apiRequest(`/admin/purchases/${id}`, { method: 'DELETE' }),
  purchasesJournalPage: (filters: Record<string, string> = {}, page = 1, perPage = 25) => fetchCollectionPage('/admin/purchases/journal', filters, page, perPage),
  purchaseStats: (filters: Record<string, string> = {}) => apiRequest<PurchaseStats>(`/admin/purchases/stats${queryString(filters)}`),
  pickupSlots: () => withFallback<PickupSlot[]>(() => apiRequest('/admin/pickup-slots'), () => mockPickupSlots),
  savePickupSlot: (payload: Partial<PickupSlot>, id?: string | number) => apiRequest<PickupSlot>(id ? `/admin/pickup-slots/${id}` : '/admin/pickup-slots', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) }),
  deletePickupSlot: (id: string | number) => apiRequest(`/admin/pickup-slots/${id}`, { method: 'DELETE' }),
  businessHours: () => withFallback<BusinessHour[]>(() => apiRequest('/admin/business-hours'), () => mockBusinessHours),
  updateBusinessHours: (hours: BusinessHour[]) => apiRequest<BusinessHour[]>('/admin/business-hours', { method: 'PUT', body: JSON.stringify({ hours }) }),
  async storeSettings() {
    const settings = await withFallback<StoreSettings>(() => apiRequest('/admin/store-settings'), () => readCachedStoreSettings());
    cacheStoreSettings(settings);
    return settings;
  },
  async updateStoreSettings(settings: StoreSettings) {
    const updatedSettings = await apiRequest<StoreSettings>('/admin/store-settings', { method: 'PUT', body: JSON.stringify(settings) });
    cacheStoreSettings(updatedSettings);
    return updatedSettings;
  },
  salesJournal: (filters: Record<string, string> = {}) => withFallback<SalesJournalRow[]>(() => fetchAllCollection('/admin/sales-journal', filters), () => []),
  salesJournalPage: (filters: Record<string, string> = {}, page = 1, perPage = 25) => withFallback<PaginatedResult<SalesJournalRow>>(
    () => fetchCollectionPage('/admin/sales-journal', filters, page, perPage),
    () => paginateRows([], page, perPage),
  ),
  purchaseAccountingExportPath: (filters: Record<string, string> = {}) => `/admin/accounting-export/purchases${queryString(filters)}`,
  openAdminFile: async (path: string) => {
    const headers = new Headers({ Accept: '*/*' });
    const token = getAdminToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const response = await fetch(`${API_BASE_URL}${path}`, { headers });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message ?? 'Ouverture impossible.');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  },
  async downloadAdminFile(path: string, filename: string) {
    const headers = new Headers({ Accept: '*/*' });
    const token = getAdminToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const response = await fetch(`${API_BASE_URL}${path}`, { headers });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message ?? 'Telechargement impossible.');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
