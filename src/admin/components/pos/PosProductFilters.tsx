import { SlidersHorizontal, X } from 'lucide-react';

export type PosProductFilter = 'all' | 'featured' | 'low_stock' | 'out_of_stock';
export type PosProductSort = 'name' | 'price_asc' | 'price_desc' | 'stock_asc';

const filterOptions: Array<{ label: string; value: PosProductFilter }> = [
  { label: 'Tous', value: 'all' },
  { label: 'Favoris', value: 'featured' },
  { label: 'Stock bas', value: 'low_stock' },
  { label: 'Rupture', value: 'out_of_stock' },
];

const sortOptions: Array<{ label: string; value: PosProductSort }> = [
  { label: 'Nom A-Z', value: 'name' },
  { label: 'Prix croissant', value: 'price_asc' },
  { label: 'Prix decroissant', value: 'price_desc' },
  { label: 'Stock faible', value: 'stock_asc' },
];

export function PosProductFilters({
  activeFilter,
  count,
  hasActiveFilters,
  onFilterChange,
  onReset,
  onSortChange,
  sort,
}: {
  activeFilter: PosProductFilter;
  count: number;
  hasActiveFilters: boolean;
  sort: PosProductSort;
  onFilterChange: (filter: PosProductFilter) => void;
  onReset: () => void;
  onSortChange: (sort: PosProductSort) => void;
}) {
  return (
    <div className="rounded-[1.35rem] border border-grove/10 bg-white/90 p-3 shadow-[0_14px_40px_rgba(31,77,54,0.06)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="inline-flex h-10 items-center gap-2 rounded-full bg-leaf-50 px-3 text-xs font-black uppercase tracking-[0.12em] text-leaf-800">
            <SlidersHorizontal size={15} />
            Filtres
          </span>
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={filterButtonClass(activeFilter === option.value)}
              onClick={() => onFilterChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-cream px-3 py-2 text-xs font-bold text-grove/60">
            {count} produit{count > 1 ? 's' : ''}
          </span>
          <select
            className="h-10 rounded-full border border-grove/10 bg-cream px-4 text-sm font-bold text-grove outline-none transition focus:border-leaf-500 focus:ring-4 focus:ring-leaf-100"
            value={sort}
            onChange={(event) => onSortChange(event.target.value as PosProductSort)}
            aria-label="Trier les produits POS"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {hasActiveFilters && (
            <button
              type="button"
              className="inline-flex h-10 items-center gap-1 rounded-full bg-tomato/10 px-3 text-xs font-black uppercase tracking-[0.1em] text-tomato transition hover:bg-tomato hover:text-white"
              onClick={onReset}
            >
              <X size={14} />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function filterButtonClass(isActive: boolean) {
  return `h-10 rounded-full px-4 text-sm font-bold transition ${
    isActive
      ? 'bg-grove text-cream shadow-soft'
      : 'border border-grove/10 bg-white text-grove/65 hover:border-leaf-200 hover:bg-leaf-50 hover:text-grove'
  }`;
}
