import { apiGet } from './client';
import type { ApiBusinessHour, ApiCollection, ApiPickupSlot, ApiStoreStatus } from './types';

function unwrapCollection<T>(response: ApiCollection<T> | T[]): T[] {
  return Array.isArray(response) ? response : response.data;
}

export async function getStoreStatus() {
  const response = await apiGet<{ data: ApiStoreStatus } | ApiStoreStatus>('/store-status');
  return 'data' in response ? response.data : response;
}

export async function getPickupSlots() {
  const response = await apiGet<ApiCollection<ApiPickupSlot> | ApiPickupSlot[]>('/pickup-slots');
  return unwrapCollection(response).filter((slot) => slot.is_active);
}

export async function getBusinessHours() {
  const response = await apiGet<ApiCollection<ApiBusinessHour> | ApiBusinessHour[]>('/business-hours');
  return unwrapCollection(response);
}
