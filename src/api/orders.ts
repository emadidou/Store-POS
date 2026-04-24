import { apiGet, apiPost } from './client';
import { API_BASE_URL } from './config';
import type { ApiOrder, CreateOrderPayload, OrderStatus, OrderVoucher } from './types';

export async function createOrder(payload: CreateOrderPayload) {
  const response = await apiPost<{ data: ApiOrder }>('/orders', {
    customer: payload.customer,
    full_name: payload.customer.full_name,
    phone: payload.customer.phone,
    email: payload.customer.email || null,
    pickup_date: payload.pickup_date,
    pickup_time: payload.pickup_time,
    payment_method: payload.payment_method,
    notes: payload.notes || null,
    items: payload.items,
  });

  return response.data;
}

export async function getOrderVoucher(orderNumber: string, token: string) {
  const search = new URLSearchParams({ token });
  const response = await apiGet<{ data: OrderVoucher }>(`/orders/${encodeURIComponent(orderNumber)}/voucher?${search.toString()}`);
  return response.data;
}

export async function getAdminOrders() {
  return adminOrderRequest<ApiOrder[]>('/admin/orders');
}

export async function getAdminOrderById(id: string | number) {
  return adminOrderRequest<ApiOrder>(`/admin/orders/${id}`);
}

export async function updateOrderStatus(id: string | number, status: OrderStatus) {
  return adminOrderRequest<ApiOrder>(`/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

async function adminOrderRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = window.localStorage.getItem('maison-verde-admin-token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message ?? 'Erreur API commandes');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const json = await response.json();
  return (json.data ?? json) as T;
}
