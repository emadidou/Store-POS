export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'cancelled';

export type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  is_active: boolean;
};

export type Product = {
  id: number;
  category_id?: number | null;
  category?: Category | null;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  price: number;
  average_purchase_cost_ht?: number | null;
  last_purchase_cost_ht?: number | null;
  last_purchased_at?: string | null;
  stock: number;
  alert_threshold?: number;
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock' | string;
  last_stock_update_at?: string | null;
  is_available: boolean;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
};

export type StockMovement = {
  id: number;
  product_id: number;
  purchase_id?: number | null;
  product?: Product | null;
  type: 'in' | 'out' | 'adjustment' | string;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason?: string | null;
  source?: string | null;
  reference?: string | null;
  note?: string | null;
  created_by?: string | null;
  created_at?: string | null;
};

export type StockStatusPoint = {
  key: string;
  label: string;
  value: number;
};

export type CriticalStockProduct = {
  id: number;
  name: string;
  category: string;
  stock: number;
  alert_threshold: number;
  status: string;
};

export type CategoryStockPoint = {
  category: string;
  stock_units: number;
  stock_value: number;
  products_count: number;
};

export type StockMovementSummaryPoint = {
  date: string;
  label: string;
  in: number;
  out: number;
  adjustment: number;
};

export type StockStats = {
  totals: {
    total_products: number;
    in_stock_products: number;
    low_stock_products: number;
    out_of_stock_products: number;
    available_products: number;
    unavailable_products: number;
    stock_units_total: number;
    stock_value_total: number;
  };
  status_distribution: StockStatusPoint[];
  availability_distribution: StockStatusPoint[];
  critical_products: CriticalStockProduct[];
  category_stock: CategoryStockPoint[];
  recent_movements: StockMovementSummaryPoint[];
};

export type OrderItem = {
  id: number;
  product_id: number;
  product_name_snapshot: string;
  unit_price: number;
  unit_price_ht?: number;
  unit_price_ttc?: number;
  vat_rate?: number | null;
  vat_amount?: number;
  quantity: number;
  subtotal: number;
  subtotal_ht?: number;
  subtotal_ttc?: number;
};

export type Order = {
  id: number;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  subtotal_ht?: number;
  total_vat?: number;
  total_ttc?: number;
  vat_rate?: number | null;
  vat_regime?: string | null;
  legal_note?: string | null;
  pickup_date: string;
  pickup_time: string;
  payment_method: string;
  notes?: string | null;
  source?: string | null;
  order_type?: 'in_store' | 'pickup' | 'reservation' | string | null;
  is_paid?: boolean;
  payment_status?: 'pending' | 'paid' | 'failed' | string | null;
  document_type?: 'invoice' | 'order_voucher' | 'credit_note' | string | null;
  invoice_number?: string | null;
  credit_note_number?: string | null;
  paid_at?: string | null;
  refunded_at?: string | null;
  refund_reason?: string | null;
  refund_amount?: number | null;
  cancelled_at?: string | null;
  stock_restored_at?: string | null;
  original_order?: {
    id: number;
    order_number: string;
    invoice_number?: string | null;
  } | null;
  customer: {
    id: number;
    full_name: string;
    phone: string;
    email?: string | null;
  };
  items?: OrderItem[];
  credit_notes?: Order[];
  created_at?: string;
};

export type Customer = {
  id: number;
  full_name: string;
  phone: string;
  email?: string | null;
  orders_count: number;
  last_order_at?: string | null;
  orders?: Order[];
};

export type Supplier = {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  siren?: string | null;
  siret?: string | null;
  vat_number?: string | null;
  notes?: string | null;
  is_active: boolean;
  purchases_count?: number;
  created_at?: string | null;
  updated_at?: string | null;
};

export type PurchaseItem = {
  id: number;
  purchase_id?: number;
  product_id: number;
  product?: Product | null;
  product_name_snapshot: string;
  quantity: number;
  unit_cost_ht: number;
  vat_rate: number;
  vat_amount: number;
  subtotal_ht: number;
  subtotal_ttc: number;
};

export type Purchase = {
  id: number;
  supplier_id?: number | null;
  supplier?: Supplier | null;
  purchase_number: string;
  external_invoice_number?: string | null;
  external_invoice_date?: string | null;
  purchase_date: string;
  status: 'draft' | 'confirmed' | 'cancelled' | string;
  subtotal_ht: number;
  total_vat: number;
  total_ttc: number;
  payment_status: 'unpaid' | 'paid' | 'partial' | string;
  payment_method?: string | null;
  paid_at?: string | null;
  notes?: string | null;
  attachment_path?: string | null;
  has_attachment?: boolean;
  attachment_url?: string | null;
  attachment_download_url?: string | null;
  confirmed_at?: string | null;
  cancelled_at?: string | null;
  stock_applied_at?: string | null;
  items?: PurchaseItem[];
  stock_movements?: StockMovement[];
  created_at?: string | null;
  updated_at?: string | null;
};

export type PickupSlot = {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  max_orders?: number | null;
  is_active: boolean;
};

export type BusinessHour = {
  id?: number;
  day_of_week: number;
  open_time?: string | null;
  close_time?: string | null;
  is_closed: boolean;
};

export type StoreSettings = {
  store_name: string;
  company_name?: string | null;
  legal_name?: string | null;
  legal_form?: string | null;
  share_capital?: number | null;
  phone: string;
  email?: string | null;
  address?: string | null;
  ice?: string | null;
  siren?: string | null;
  siret?: string | null;
  ape_code?: string | null;
  rc?: string | null;
  rcs_city?: string | null;
  vat_number?: string | null;
  tva?: string | null;
  vat_rate?: number | null;
  vat_exempt?: boolean;
  vat_regime?: 'standard' | 'franchise_base' | string | null;
  default_vat_rate?: number | null;
  legal_vat_note?: string | null;
  pickup_buffer_minutes: number;
  currency: string;
  timezone: string;
  open_message?: string;
  closed_message?: string;
};

export type SalesJournalRow = {
  date_document: string;
  order_number: string;
  document_type: string;
  invoice_number?: string | null;
  credit_note_number?: string | null;
  original_invoice_number?: string | null;
  original_order_number?: string | null;
  customer_name?: string | null;
  amount_ht: number;
  amount_vat: number;
  amount_ttc: number;
  payment_method: string;
  source?: string | null;
  payment_status: string;
  order_status: string;
  vat_rate?: number | null;
  vat_regime?: string | null;
  refund_reason?: string | null;
  entry_type?: string;
};

export type PurchaseJournalRow = {
  date_purchase: string;
  purchase_number: string;
  supplier_name?: string | null;
  external_invoice_number?: string | null;
  amount_ht: number;
  amount_vat: number;
  amount_ttc: number;
  payment_status: string;
  payment_method?: string | null;
  has_attachment: boolean;
  notes?: string | null;
};

export type PurchaseStats = {
  month_total_ttc: number;
  month_total_vat: number;
  suppliers: Array<{ supplier: string; total_ttc: number }>;
  products: Array<{ product: string; quantity: number }>;
  daily_series: Array<{ date: string; total_ttc: number; total_vat: number }>;
};

export type StoreStatus = {
  is_open: boolean;
  message: string;
  opens_at?: string | null;
  closes_at?: string | null;
  timezone: string;
};

export type PaginatedResult<T> = {
  data: T[];
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
};
