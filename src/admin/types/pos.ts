import type { Product } from '../api/types';

export type PosCartItem = {
  product: Product;
  quantity: number;
};

export type PosOrderType = 'in_store' | 'pickup' | 'reservation';

export type PosPaymentMethod = 'cash' | 'stripe_later_ready' | 'stripe';

export type PosCustomer = {
  full_name: string;
  phone: string;
  email: string;
  notes: string;
};
