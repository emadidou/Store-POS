import { ShoppingCart, Trash2 } from 'lucide-react';
import type { PosCartItem as PosCartItemType, PosPaymentMethod } from '../../types/pos';
import { money } from '../../utils/format';
import { PosCartItem } from './PosCartItem';
import { PosPaymentSelector } from './PosPaymentSelector';

export function PosCart({
  items,
  isSubmitting,
  onClear,
  onPaymentChange,
  onQuantity,
  onRemove,
  onSubmit,
  paymentMethod,
}: {
  items: PosCartItemType[];
  paymentMethod: PosPaymentMethod;
  isSubmitting: boolean;
  onPaymentChange: (method: PosPaymentMethod) => void;
  onQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  onClear: () => void;
  onSubmit: () => void;
}) {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <aside className="grid max-h-[calc(100vh-8rem)] gap-4 rounded-[2rem] border border-grove/10 bg-white p-4 shadow-soft lg:sticky lg:top-24">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-grove">
          <ShoppingCart size={22} />
          Ticket
        </h2>
        <button type="button" className="grid h-9 w-9 place-items-center rounded-full bg-tomato/10 text-tomato" onClick={onClear} aria-label="Vider">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="grid max-h-[38vh] gap-3 overflow-y-auto pr-1">
        {items.length === 0 ? (
          <p className="rounded-2xl bg-cream p-4 text-sm font-semibold text-grove/55">Cliquez sur un produit pour l'ajouter.</p>
        ) : (
          items.map((item) => (
            <PosCartItem key={item.product.id} item={item} onQuantity={(quantity) => onQuantity(item.product.id, quantity)} onRemove={() => onRemove(item.product.id)} />
          ))
        )}
      </div>

      <PosPaymentSelector value={paymentMethod} onChange={onPaymentChange} />

      <div className="rounded-3xl bg-grove p-5 text-cream">
        <div className="flex items-end justify-between gap-4">
          <span className="text-sm font-semibold text-cream/65">Total</span>
          <span className="font-display text-4xl font-semibold">{money(total)}</span>
        </div>
        <button type="button" className="mt-5 h-14 w-full rounded-2xl bg-citrus text-base font-black text-grove transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting || items.length === 0} onClick={onSubmit}>
          {isSubmitting ? 'Validation...' : paymentMethod === 'stripe_later_ready' ? 'Creer le bon' : 'Encaisser et facturer'}
        </button>
      </div>
    </aside>
  );
}
