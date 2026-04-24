export type ApiCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ApiProduct = {
  id: number;
  category_id?: number | null;
  category?: ApiCategory | null;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  price: number;
  stock: number;
  alert_threshold?: number;
  stock_status?: string;
  is_available: boolean;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ApiCollection<T> = {
  data: T[];
  links?: unknown;
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  } | unknown;
};

export type UiProduct = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  category: string;
  categorySlug?: string;
  price: string;
  priceValue: number;
  stock: number;
  badge: string;
  image: string;
  is_available: boolean;
  is_featured: boolean;
};

export type UiCategory = {
  id: number;
  title: string;
  slug: string;
  count: string;
  description: string;
  image: string;
  is_active: boolean;
};

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'cancelled';

export type ApiCustomer = {
  id: number;
  full_name: string;
  phone: string;
  email?: string | null;
};

export type ApiOrderItem = {
  id: number;
  product_id: number;
  product_name_snapshot: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
};

export type ApiOrder = {
  id: number;
  order_number: string;
  voucher_token?: string | null;
  status: OrderStatus;
  total_amount: number;
  pickup_date: string;
  pickup_time: string;
  payment_method: string;
  notes?: string | null;
  source?: string | null;
  customer: ApiCustomer;
  items?: ApiOrderItem[];
  created_at?: string;
  updated_at?: string;
};

export type ApiStoreSettings = {
  id?: number;
  store_name: string;
  company_name?: string | null;
  legal_form?: string | null;
  share_capital?: number | null;
  phone: string;
  email?: string | null;
  address?: string | null;
  siren?: string | null;
  siret?: string | null;
  ape_code?: string | null;
  rc?: string | null;
  rcs_city?: string | null;
  vat_number?: string | null;
  ice?: string | null;
  vat_rate?: number | null;
  vat_exempt?: boolean;
  vat_regime?: string | null;
  default_vat_rate?: number | null;
  legal_vat_note?: string | null;
  currency?: string;
  timezone?: string;
  pickup_buffer_minutes?: number;
  open_message?: string | null;
  closed_message?: string | null;
};

export type ApiPickupSlot = {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  max_orders?: number | null;
  is_active: boolean;
};

export type ApiBusinessHour = {
  id?: number;
  day_of_week: number;
  open_time?: string | null;
  close_time?: string | null;
  is_closed: boolean;
};

export type ApiStoreStatus = {
  is_open: boolean;
  message: string;
  opens_at?: string | null;
  closes_at?: string | null;
  timezone: string;
};

export type OrderVoucher = {
  order: ApiOrder;
  store: ApiStoreSettings;
};

export type CreateOrderPayload = {
  customer: {
    full_name: string;
    phone: string;
    email?: string;
  };
  pickup_date: string;
  pickup_time: string;
  payment_method: 'cash' | 'stripe_later_ready' | 'stripe';
  notes?: string;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
};
