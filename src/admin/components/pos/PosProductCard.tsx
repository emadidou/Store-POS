import { Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '../../api/types';
import { money } from '../../utils/format';

export function PosProductCard({ onAdd, product }: { product: Product; onAdd: (product: Product) => void }) {
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <button
      type="button"
      className="group grid overflow-hidden rounded-3xl border border-grove/10 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-leaf-200 hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-45"
      disabled={!product.is_available || product.stock <= 0}
      onClick={() => onAdd(product)}
    >
      <span className="relative h-28 overflow-hidden bg-leaf-50">
        {product.image && !hasImageError ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
            onError={() => setHasImageError(true)}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-leaf-700/45">
            <ImageIcon size={26} />
          </span>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-leaf-700 shadow-sm">
          {product.category?.name ?? 'Produit'}
        </span>
      </span>
      <span className="grid min-h-32 p-4">
        <span className="font-display text-lg font-semibold leading-tight text-grove">{product.name}</span>
        <span className="mt-auto flex items-end justify-between gap-3">
          <span className="text-sm font-semibold text-grove/55">Stock {product.stock}</span>
          <span className="font-display text-xl font-semibold text-grove">{money(product.price)}</span>
        </span>
      </span>
    </button>
  );
}
