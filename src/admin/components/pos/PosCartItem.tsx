import { Minus, Plus, Trash2 } from 'lucide-react';
import type { PosCartItem as PosCartItemType } from '../../types/pos';
import { money } from '../../utils/format';

export function PosCartItem({
  item,
  onQuantity,
  onRemove,
}: {
  item: PosCartItemType;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  const subtotal = item.product.price * item.quantity;

  return (
    <article className="grid gap-2 rounded-2xl bg-cream p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold leading-tight text-grove">{item.product.name}</p>
          <p className="mt-1 text-xs font-semibold text-grove/50">{money(item.product.price)} / kg</p>
        </div>
        <button type="button" className="grid h-8 w-8 place-items-center rounded-full bg-tomato/10 text-tomato" onClick={onRemove} aria-label="Supprimer">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button type="button" className="grid h-9 w-9 place-items-center rounded-full bg-white text-grove" onClick={() => onQuantity(Math.max(0.25, item.quantity - 0.25))}>
            <Minus size={14} />
          </button>
          <input className="h-9 w-20 rounded-full border border-grove/10 bg-white text-center text-sm font-bold outline-none" type="number" min="0.001" step="0.25" value={item.quantity} onChange={(event) => onQuantity(Number(event.target.value))} />
          <button type="button" className="grid h-9 w-9 place-items-center rounded-full bg-white text-grove" onClick={() => onQuantity(item.quantity + 0.25)}>
            <Plus size={14} />
          </button>
        </div>
        <p className="font-display text-lg font-semibold text-grove">{money(subtotal)}</p>
      </div>
    </article>
  );
}
