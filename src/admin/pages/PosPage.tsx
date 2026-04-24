import { ChevronLeft, ChevronRight, Expand, Minimize2, RotateCcw, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../api/client';
import type { Category, Order, OrderStatus, Product, StoreSettings } from '../api/types';
import { PosCart } from '../components/pos/PosCart';
import { PosCustomerQuickForm } from '../components/pos/PosCustomerQuickForm';
import { PosProductGrid } from '../components/pos/PosProductGrid';
import { PosProductFilters, type PosProductFilter, type PosProductSort } from '../components/pos/PosProductFilters';
import { PosReceiptView } from '../components/pos/PosReceiptView';
import { PosRecentOrders } from '../components/pos/PosRecentOrders';
import { PosSearchBar } from '../components/pos/PosSearchBar';
import type { PosCartItem, PosCustomer, PosOrderType, PosPaymentMethod } from '../types/pos';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { printerService } from '../services/printerService';

const quickCustomer: PosCustomer = {
  full_name: '',
  phone: '',
  email: '',
  notes: '',
};

function today() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function nowTime() {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 15);
  return date.toTimeString().slice(0, 5);
}

export function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [storeSettings, setStoreSettings] = useState<Partial<StoreSettings>>({ store_name: 'Maison Verde' });
  const [query, setQuery] = useState('');
  const [productFilter, setProductFilter] = useState<PosProductFilter>('all');
  const [productSort, setProductSort] = useState<PosProductSort>('name');
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [hasHydratedCart, setHasHydratedCart] = useState(false);
  const [customer, setCustomer] = useState<PosCustomer>(quickCustomer);
  const [orderType, setOrderType] = useState<PosOrderType>('in_store');
  const [paymentMethod, setPaymentMethod] = useState<PosPaymentMethod>('cash');
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([adminApi.products(), adminApi.categories(), adminApi.orders(), adminApi.storeSettings()])
      .then(([nextProducts, nextCategories, nextOrders, settings]) => {
        const availableProducts = nextProducts.filter((product) => product.is_available);
        setProducts(availableProducts);
        setCategories(nextCategories.filter((nextCategory) => nextCategory.is_active));
        setOrders(nextOrders);
        setStoreSettings(settings);
        setCart(loadCart(availableProducts));
        setHasHydratedCart(true);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Impossible de charger la caisse.');
      });
  }, []);

  useEffect(() => {
    if (!hasHydratedCart) return;
    window.localStorage.setItem('maison-verde-pos-cart', JSON.stringify(cart.map((item) => ({ productId: item.product.id, quantity: item.quantity }))));
  }, [cart, hasHydratedCart]);

  useEffect(() => {
    const updateFullscreenState = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', updateFullscreenState);
    return () => document.removeEventListener('fullscreenchange', updateFullscreenState);
  }, []);

  useEffect(() => {
    if (!isFullscreen) {
      setIsRightPanelCollapsed(false);
    }
  }, [isFullscreen]);

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();

    return products.filter((product) => {
      const searchable = [
        product.name,
        product.slug,
        product.description,
        product.category?.name,
        product.category?.slug,
        String(product.id),
      ].filter(Boolean).join(' ').toLowerCase();
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
      const matchesQuickFilter =
        productFilter === 'all'
        || (productFilter === 'featured' && product.is_featured)
        || (productFilter === 'low_stock' && product.stock > 0 && product.stock <= (product.alert_threshold ?? 0))
        || (productFilter === 'out_of_stock' && product.stock <= 0);

      return matchesQuery && matchesQuickFilter;
    }).sort(sortProducts(productSort));
  }, [productFilter, productSort, products, query]);

  const hasActiveProductFilters = query.trim() !== '' || productFilter !== 'all' || productSort !== 'name';

  const resetProductFilters = () => {
    setQuery('');
    setProductFilter('all');
    setProductSort('name');
  };

  const todaysOrders = useMemo(() => orders.filter((order) => order.pickup_date === today()), [orders]);

  const addProduct = (product: Product) => {
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }

      return [...current, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (!Number.isFinite(quantity) || quantity <= 0) return;
    setCart((current) => current.map((item) => item.product.id === productId ? { ...item, quantity } : item));
  };

  const removeItem = (productId: number) => setCart((current) => current.filter((item) => item.product.id !== productId));
  const resetTicket = () => {
    setCart([]);
    setCustomer(quickCustomer);
    setOrderType('in_store');
    setPaymentMethod('cash');
    setError('');
  };

  const submitOrder = async () => {
    if (cart.length === 0) return;

    setIsSubmitting(true);
    setError('');

    try {
      const paymentCaptured = paymentMethod === 'cash' || paymentMethod === 'stripe';
      const created = await adminApi.saveOrder({
        customer: {
          full_name: customer.full_name.trim() || 'Client caisse',
          phone: customer.phone.trim() || 'POS-CAISSE',
          email: customer.email.trim() || null,
        },
        pickup_date: today(),
        pickup_time: nowTime(),
        payment_method: paymentMethod,
        status: paymentCaptured ? 'confirmed' : 'pending',
        source: 'pos',
        order_type: orderType,
        payment_captured: paymentCaptured,
        notes: customer.notes.trim() || null,
        items: cart.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
      });

      setLastOrder(created);
      setOrders((current) => [created, ...current]);
      resetTicket();
      printerService.printReceipt({ onBeforePrint: () => setLastOrder(created) });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Impossible de valider la commande.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateOrderStatus = async (id: number, status: OrderStatus) => {
    const updated = await adminApi.updateOrderStatus(id, status);
    setOrders((current) => current.map((order) => order.id === id ? updated : order));
  };

  const printOrder = (order: Order) => {
    setLastOrder(order);
    printerService.printReceipt({ onBeforePrint: () => setLastOrder(order) });
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      await document.documentElement.requestFullscreen();
    } catch {
      setError('Impossible d’activer le plein ecran sur ce navigateur.');
    }
  };

  if (error && products.length === 0 && categories.length === 0) {
    return <ErrorState title="Caisse indisponible" description={error} />;
  }

  if (products.length === 0 && categories.length === 0) {
    return <LoadingState label="Chargement de la caisse..." />;
  }

  const canCollapsePanels = isFullscreen;

  return (
    <>
      <div className="pos-print-hide mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700">Caisse rapide</p>
          <h1 className="mt-2 flex items-center gap-2 font-display text-4xl font-semibold tracking-tight text-grove">
            <Zap size={30} />
            POS {storeSettings.store_name ?? 'Maison Verde'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-grove/65">Recherche instantanee, ticket rapide, encaissement et commandes du jour.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-secondary w-max" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 size={17} /> : <Expand size={17} />}
            {isFullscreen ? 'Quitter plein ecran' : 'Plein ecran'}
          </button>
          <button type="button" className="btn btn-secondary w-max" onClick={resetTicket}>
            <RotateCcw size={17} />
            Nouvelle commande
          </button>
        </div>
      </div>

      {error && <p className="pos-print-hide mb-4 rounded-2xl bg-tomato/10 p-3 text-sm font-semibold text-tomato">{error}</p>}

      {canCollapsePanels && !isRightPanelCollapsed && (
        <button
          type="button"
          className="pos-print-hide fixed right-4 top-1/2 z-[100010] hidden -translate-y-1/2 flex-col items-center gap-2 rounded-full bg-white px-3 py-5 text-xs font-black uppercase tracking-[0.12em] text-grove shadow-[0_24px_70px_rgba(18,61,45,0.18)] ring-1 ring-grove/10 transition hover:-translate-y-[52%] hover:bg-grove hover:text-cream xl:flex"
          onClick={() => setIsRightPanelCollapsed(true)}
          aria-label="Reduire le panneau caisse"
        >
          <ChevronRight size={20} />
          <span className="[writing-mode:vertical-rl]">Reduire</span>
        </button>
      )}

      <div className={`pos-print-hide grid gap-5 ${canCollapsePanels && isRightPanelCollapsed ? 'xl:grid-cols-1' : 'xl:grid-cols-[1fr_420px]'}`}>
        <main className="flex flex-col gap-4 self-start">
          <PosSearchBar value={query} onChange={setQuery} />
          <PosProductFilters
            activeFilter={productFilter}
            count={visibleProducts.length}
            hasActiveFilters={hasActiveProductFilters}
            sort={productSort}
            onFilterChange={setProductFilter}
            onReset={resetProductFilters}
            onSortChange={setProductSort}
          />
          <PosProductGrid
            products={visibleProducts}
            emptyDescription="Aucun produit ne correspond aux filtres POS actifs. Essayez de reinitialiser les filtres."
            onAdd={addProduct}
          />
        </main>

        {canCollapsePanels && isRightPanelCollapsed ? (
          <button
            type="button"
            className="fixed right-4 top-1/2 z-[100010] flex -translate-y-1/2 flex-col items-center gap-2 rounded-full bg-grove px-3 py-5 text-xs font-black uppercase tracking-[0.12em] text-cream shadow-[0_24px_70px_rgba(18,61,45,0.28)] transition hover:-translate-y-[52%] hover:bg-leaf-700"
            onClick={() => setIsRightPanelCollapsed(false)}
            aria-label="Ouvrir le panneau caisse"
          >
            <ChevronLeft size={20} />
            <span className="[writing-mode:vertical-rl]">Caisse</span>
          </button>
        ) : (
          <aside className="grid gap-4">
            {canCollapsePanels && (
              <button
                type="button"
                className="btn btn-secondary justify-center"
                onClick={() => setIsRightPanelCollapsed(true)}
              >
                <ChevronRight size={17} />
                Reduire le panneau
              </button>
            )}
            <PosCustomerQuickForm customer={customer} orderType={orderType} onChange={setCustomer} onOrderTypeChange={setOrderType} />
            <PosCart items={cart} paymentMethod={paymentMethod} isSubmitting={isSubmitting} onPaymentChange={setPaymentMethod} onQuantity={updateQuantity} onRemove={removeItem} onClear={() => setCart([])} onSubmit={submitOrder} />
            <PosRecentOrders orders={todaysOrders} onPrint={printOrder} onStatus={updateOrderStatus} />
          </aside>
        )}
      </div>

      <div className="pos-print-only">
        <PosReceiptView order={lastOrder} store={storeSettings} />
      </div>
    </>
  );
}

function sortProducts(sort: PosProductSort) {
  return (first: Product, second: Product) => {
    if (sort === 'price_asc') return first.price - second.price;
    if (sort === 'price_desc') return second.price - first.price;
    if (sort === 'stock_asc') return first.stock - second.stock;

    return first.name.localeCompare(second.name, 'fr', { sensitivity: 'base' });
  };
}

function loadCart(products: Product[]): PosCartItem[] {
  try {
    const stored: Array<{ productId: number; quantity: number }> = JSON.parse(window.localStorage.getItem('maison-verde-pos-cart') ?? '[]');
    if (!Array.isArray(stored)) return [];
    return stored
      .map((storedItem) => {
        const product = products.find((candidate) => candidate.id === storedItem.productId);
        return product ? { product, quantity: storedItem.quantity } : null;
      })
      .filter((item): item is PosCartItem => Boolean(item));
  } catch {
    return [];
  }
}
