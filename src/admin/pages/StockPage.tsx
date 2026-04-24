import { ArrowDown, ArrowUp, Boxes, SquarePen } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '../api/client';
import type { Product, StockMovement, StockStats, StoreSettings } from '../api/types';
import { DataTable } from '../components/DataTable';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { adminInputClass, FormField } from '../components/FormField';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { SearchInput } from '../components/SearchInput';
import { StockAdjustModal } from '../components/stock/StockAdjustModal';
import { StockByCategoryChart } from '../components/stock/StockByCategoryChart';
import { LowStockChart } from '../components/stock/LowStockChart';
import { StockDistributionChart } from '../components/stock/StockDistributionChart';
import { StockMovementsChart } from '../components/stock/StockMovementsChart';
import { StockMovementsTable } from '../components/stock/StockMovementsTable';
import { StockOverviewCards } from '../components/stock/StockOverviewCards';
import { StockStatusBadge } from '../components/stock/StockStatusBadge';
import { StockStatusChart } from '../components/stock/StockStatusChart';
import { StockTabs, type StockTabKey } from '../components/stock/StockTabs';
import { money, shortDate } from '../utils/format';

type StockFilters = {
  search: string;
  status: string;
  availability: string;
};

type MovementFilters = {
  search: string;
  type: string;
  source: string;
};

const emptyStockFilters: StockFilters = {
  search: '',
  status: '',
  availability: '',
};

const emptyMovementFilters: MovementFilters = {
  search: '',
  type: '',
  source: '',
};

export function StockPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [stats, setStats] = useState<StockStats | null>(null);
  const [movements, setMovements] = useState<StockMovement[] | null>(null);
  const [storeSettings, setStoreSettings] = useState<Partial<StoreSettings>>({ currency: 'EUR' });
  const [stockFilters, setStockFilters] = useState<StockFilters>(emptyStockFilters);
  const [movementFilters, setMovementFilters] = useState<MovementFilters>(emptyMovementFilters);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [adjustMode, setAdjustMode] = useState<'in' | 'out' | 'adjustment' | null>(null);
  const [isFilteringStock, setIsFilteringStock] = useState(false);
  const [isFilteringMovements, setIsFilteringMovements] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState('');

  const activeTab = normalizeTab(searchParams.get('tab'));

  useEffect(() => {
    adminApi.storeSettings().then(setStoreSettings).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger le stock.');
    });
  }, []);

  useEffect(() => {
    adminApi.stockStats().then(setStats).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les statistiques de stock.');
    });
  }, [reloadKey]);

  useEffect(() => {
    let cancelled = false;
    setIsFilteringStock(true);

    const timeout = window.setTimeout(() => {
      adminApi.stock(stockFilters)
        .then((nextProducts) => {
          if (!cancelled) setProducts(nextProducts);
        })
        .catch((loadError) => {
          if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les produits en stock.');
        })
        .finally(() => {
          if (!cancelled) setIsFilteringStock(false);
        });
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [stockFilters, reloadKey]);

  useEffect(() => {
    if (activeTab !== 'movements' && movements !== null) return;

    let cancelled = false;
    setIsFilteringMovements(true);

    const timeout = window.setTimeout(() => {
      adminApi.stockMovements(movementFilters)
        .then((nextRows) => {
          if (!cancelled) setMovements(nextRows);
        })
        .catch((loadError) => {
          if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les mouvements de stock.');
        })
        .finally(() => {
          if (!cancelled) setIsFilteringMovements(false);
        });
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [activeTab, movementFilters, reloadKey]);

  const stockSummary = useMemo(() => {
    const list = products ?? [];
    return {
      total: list.length,
      lowStock: list.filter((product) => product.stock_status === 'low_stock').length,
      outOfStock: list.filter((product) => product.stock_status === 'out_of_stock').length,
      unavailable: list.filter((product) => !product.is_available).length,
    };
  }, [products]);

  const setTab = (tab: StockTabKey) => {
    const next = new URLSearchParams(searchParams);
    if (tab === 'stock') {
      next.delete('tab');
    } else {
      next.set('tab', tab);
    }
    setSearchParams(next, { replace: true });
  };

  const openAdjust = (product: Product, mode: 'in' | 'out' | 'adjustment') => {
    setActiveProduct(product);
    setAdjustMode(mode);
  };

  const refreshData = () => setReloadKey((current) => current + 1);

  const toggleAvailability = async (product: Product) => {
    await adminApi.updateProductStock(product.id, {
      is_available: !product.is_available,
      reason: product.is_available ? 'Masquage manuel' : 'Activation manuelle',
    });
    refreshData();
  };

  if (error && (!products || !stats)) return <ErrorState title="Stock indisponible" description={error} />;
  if (!products || !stats) return <LoadingState label="Chargement du stock..." />;

  return (
    <>
      <PageHeader
        title="Stock"
        description="Pilotez les niveaux de stock, les alertes critiques et les mouvements sur une seule page admin."
      />
      {error && <p className="mb-4 rounded-2xl bg-tomato/10 p-3 text-sm font-semibold text-tomato">{error}</p>}

      <StockTabs activeTab={activeTab} onChange={setTab} />

      {activeTab === 'stock' && (
        <>
          <section className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Produits suivis" value={stats.totals.total_products} hint="vue operationnelle" tone="default" />
            <SummaryCard label="Ruptures" value={stats.totals.out_of_stock_products} hint="a traiter vite" tone="danger" />
            <SummaryCard label="Stock faible" value={stats.totals.low_stock_products} hint="reassort recommande" tone="warning" />
            <SummaryCard label="Indisponibles" value={stats.totals.unavailable_products} hint="masques cote vente" tone="muted" />
          </section>

          <section className="mb-5 rounded-[1.5rem] border border-grove/10 bg-white/85 p-4 shadow-[0_1px_0_rgba(31,77,54,0.08)]">
            <div className="grid gap-3 lg:grid-cols-[1.3fr_repeat(2,minmax(180px,1fr))]">
              <FormField label="Recherche">
                <SearchInput value={stockFilters.search} onChange={(value) => setStockFilters((current) => ({ ...current, search: value }))} placeholder="Produit, slug, categorie..." />
              </FormField>
              <FormField label="Statut stock">
                <select className={adminInputClass} value={stockFilters.status} onChange={(event) => setStockFilters((current) => ({ ...current, status: event.target.value }))}>
                  <option value="">Tous</option>
                  <option value="in_stock">En stock</option>
                  <option value="low_stock">Stock faible</option>
                  <option value="out_of_stock">Rupture</option>
                </select>
              </FormField>
              <FormField label="Disponibilite">
                <select className={adminInputClass} value={stockFilters.availability} onChange={(event) => setStockFilters((current) => ({ ...current, availability: event.target.value }))}>
                  <option value="">Toutes</option>
                  <option value="available">Disponibles</option>
                  <option value="unavailable">Indisponibles</option>
                </select>
              </FormField>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-grove/45">
              <span>{stockSummary.total} produit{stockSummary.total > 1 ? 's' : ''}</span>
              <span className="rounded-full bg-leaf-50 px-2 py-1 text-leaf-700">{stockSummary.lowStock} faible</span>
              <span className="rounded-full bg-tomato/10 px-2 py-1 text-tomato">{stockSummary.outOfStock} rupture</span>
              {isFilteringStock && <span className="rounded-full bg-cream px-2 py-1 text-grove/65">Mise a jour...</span>}
            </div>
          </section>

          {products.length === 0 ? (
            <EmptyState title="Aucun produit a afficher" description="Essayez un autre filtre ou ajoutez des produits au catalogue." />
          ) : (
            <DataTable
              columns={['Produit', 'Categorie', 'Stock actuel', 'Seuil', 'Statut', 'Disponibilite', 'Derniere MAJ', 'Actions']}
              rows={products.map((product) => (
                <tr key={product.id} className="hover:bg-leaf-50/45">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="h-12 w-12 rounded-2xl object-cover ring-1 ring-grove/10" loading="lazy" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf-50 text-leaf-700/40">
                          <Boxes size={18} />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-xs text-grove/50">{money(product.price, storeSettings.currency ?? 'EUR')} - {product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">{product.category?.name ?? '-'}</td>
                  <td className="px-5 py-4 text-base font-black text-grove">{product.stock}</td>
                  <td className="px-5 py-4">{product.alert_threshold ?? 0}</td>
                  <td className="px-5 py-4"><StockStatusBadge status={product.stock_status} /></td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      className={`rounded-full px-3 py-2 text-xs font-bold ${product.is_available ? 'bg-leaf-50 text-leaf-700' : 'bg-tomato/10 text-tomato'}`}
                      onClick={() => toggleAvailability(product)}
                    >
                      {product.is_available ? 'Disponible' : 'Indisponible'}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-sm text-grove/60">{shortDate(product.last_stock_update_at ?? product.updated_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
                      <button type="button" className="inline-grid h-9 w-9 place-items-center rounded-full bg-leaf-50 text-leaf-700" onClick={() => openAdjust(product, 'in')} title="Ajouter du stock" aria-label="Ajouter du stock">
                        <ArrowUp size={15} />
                      </button>
                      <button type="button" className="inline-grid h-9 w-9 place-items-center rounded-full bg-amber-100 text-amber-700" onClick={() => openAdjust(product, 'out')} title="Retirer du stock" aria-label="Retirer du stock">
                        <ArrowDown size={15} />
                      </button>
                      <button type="button" className="inline-grid h-9 w-9 place-items-center rounded-full bg-grove text-cream" onClick={() => openAdjust(product, 'adjustment')} title="Corriger le stock" aria-label="Corriger le stock">
                        <SquarePen size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            />
          )}
        </>
      )}

      {activeTab === 'statistics' && (
        <div className="space-y-5">
          <StockOverviewCards stats={stats} currency={storeSettings.currency ?? 'EUR'} />
          <section className="grid gap-5 xl:grid-cols-2">
            <StockStatusChart data={stats.status_distribution} />
            <StockDistributionChart data={stats.status_distribution} />
          </section>
          <section className="grid gap-5 xl:grid-cols-2">
            <LowStockChart data={stats.critical_products} />
            <StockByCategoryChart data={stats.category_stock} />
          </section>
          <StockMovementsChart data={stats.recent_movements} />
        </div>
      )}

      {activeTab === 'movements' && (
        <>
          <section className="mb-5 grid gap-3 rounded-[1.5rem] border border-grove/10 bg-white p-4 shadow-soft lg:grid-cols-[1.3fr_repeat(2,minmax(180px,1fr))]">
            <FormField label="Recherche">
              <SearchInput value={movementFilters.search} onChange={(value) => setMovementFilters((current) => ({ ...current, search: value }))} placeholder="Produit, raison, note..." />
            </FormField>
            <FormField label="Type">
              <select className={adminInputClass} value={movementFilters.type} onChange={(event) => setMovementFilters((current) => ({ ...current, type: event.target.value }))}>
                <option value="">Tous</option>
                <option value="in">Entree</option>
                <option value="out">Sortie</option>
                <option value="adjustment">Correction</option>
              </select>
            </FormField>
            <FormField label="Source">
              <select className={adminInputClass} value={movementFilters.source} onChange={(event) => setMovementFilters((current) => ({ ...current, source: event.target.value }))}>
                <option value="">Toutes</option>
                <option value="admin">Admin</option>
                <option value="pos">POS</option>
                <option value="online">Online</option>
                <option value="web">Web</option>
              </select>
            </FormField>
          </section>

          {movements ? (
            <>
              <div className="mb-5">
                <StockMovementsChart data={stats.recent_movements} />
              </div>
              {isFilteringMovements && <p className="mb-3 text-sm font-semibold text-grove/55">Mise a jour des mouvements...</p>}
              <StockMovementsTable rows={movements} />
            </>
          ) : (
            <LoadingState label="Chargement des mouvements de stock..." />
          )}
        </>
      )}

      <StockAdjustModal
        product={activeProduct}
        mode={adjustMode}
        onClose={() => {
          setActiveProduct(null);
          setAdjustMode(null);
        }}
        onSaved={() => refreshData()}
      />
    </>
  );
}

function SummaryCard({ label, value, hint, tone }: { label: string; value: number; hint: string; tone: 'default' | 'danger' | 'warning' | 'muted' }) {
  const classes = {
    default: 'bg-white text-grove',
    danger: 'bg-tomato/10 text-tomato',
    warning: 'bg-amber-100 text-amber-700',
    muted: 'bg-leaf-50 text-leaf-700',
  };

  return (
    <article className={`rounded-[1.5rem] border border-grove/10 p-5 shadow-soft ${classes[tone]}`}>
      <p className="text-xs font-bold uppercase tracking-[0.14em] opacity-70">{label}</p>
      <p className="mt-3 text-4xl font-black">{value}</p>
      <p className="mt-2 text-sm font-medium opacity-80">{hint}</p>
    </article>
  );
}

function normalizeTab(value: string | null): StockTabKey {
  if (value === 'statistics' || value === 'movements') {
    return value;
  }

  return 'stock';
}
