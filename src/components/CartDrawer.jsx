import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, ShoppingBasket, Trash2, X } from 'lucide-react';
import { formatPrice, formatUnitPrice, formatWeight, getLineTotal, getOrderTotals, getWeightGrams } from '../utils/order.js';

const WEIGHT_STEP_GRAMS = 250;

export function CartDrawer({ currency, items, isOpen, onCheckout, onClear, onClose, onWeightChange, onRemove }) {
  const { total: subtotal, totalWeight } = getOrderTotals(items);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-[70] bg-grove/35 backdrop-blur-[2px]"
            aria-label="Fermer la commande"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed bottom-0 right-0 top-0 z-[80] flex w-full max-w-md flex-col bg-cream shadow-[0_24px_80px_rgba(31,77,54,0.24)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Ma commande"
          >
            <div className="flex items-center justify-between gap-4 border-b border-grove/10 px-5 py-5">
              <div>
                <p className="eyebrow">Ma commande</p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-grove">
                  {items.length} produit{items.length > 1 ? 's' : ''} - {formatWeight(totalWeight)}
                </h2>
              </div>
              <button
                type="button"
                className="grid h-11 w-11 place-items-center rounded-full border border-grove/15 bg-white text-grove transition hover:bg-linen"
                onClick={onClose}
                aria-label="Fermer la commande"
              >
                <X size={20} />
              </button>
            </div>

            {items.length > 0 ? (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  <div className="grid gap-4">
                    {items.map((item) => (
                      <CartLine
                        key={item.name}
                        currency={currency}
                        item={item}
                        onRemove={onRemove}
                        onWeightChange={onWeightChange}
                      />
                    ))}
                  </div>
                </div>

                <div className="border-t border-grove/10 bg-white px-5 py-5">
                  <div className="flex items-center justify-between text-sm font-medium text-grove/65">
                    <span>Sous-total</span>
                    <span>{formatPrice(subtotal, currency)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between font-display text-2xl font-semibold text-grove">
                    <span>Total</span>
                    <span>{formatPrice(subtotal, currency)}</span>
                  </div>
                  <p className="mt-2 text-xs font-medium text-grove/55">
                    Le checkout vous permettra d’indiquer vos coordonnées, l’heure de retrait et le mode de paiement.
                  </p>
                  <button type="button" className="btn btn-primary mt-5 w-full justify-center" onClick={onCheckout}>
                    Passer au checkout
                    <ShoppingBasket size={18} />
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full rounded-full px-5 py-3 text-sm font-semibold text-grove/65 transition hover:bg-cream hover:text-tomato"
                    onClick={onClear}
                  >
                    Vider la commande
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-leaf-50 text-leaf-700">
                  <ShoppingBasket size={28} strokeWidth={1.7} />
                </span>
                <h3 className="mt-5 font-display text-2xl font-semibold text-grove">Votre commande est vide</h3>
                <p className="mt-3 text-sm leading-6 text-grove/65">
                  Ajoutez des fruits, légumes ou paniers frais au poids pour préparer votre commande.
                </p>
                <button type="button" className="btn btn-primary mt-6" onClick={onClose}>
                  Continuer mes achats
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function CartLine({ currency, item, onRemove, onWeightChange }) {
  const weightGrams = getWeightGrams(item);
  const lineTotal = getLineTotal(item);

  return (
    <article className="grid grid-cols-[82px_1fr] gap-4 rounded-[1.25rem] bg-white p-3 shadow-[0_1px_0_rgba(31,77,54,0.08)]">
      <img
        src={item.image}
        alt={item.name}
        className="h-24 w-full rounded-2xl object-cover"
        loading="lazy"
      />
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-grove/45">
              {item.category} - {formatUnitPrice(item.priceValue ?? 0, currency)}
            </p>
            <h3 className="mt-1 font-display text-lg font-semibold leading-6 text-grove">{item.name}</h3>
          </div>
          <button
            type="button"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cream text-grove/65 transition hover:bg-linen hover:text-tomato"
            onClick={() => onRemove(item.name)}
            aria-label={`Retirer ${item.name}`}
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center rounded-full border border-grove/10 bg-cream p-1">
            <button
              type="button"
              className="grid h-8 w-8 place-items-center rounded-full text-grove transition hover:bg-white"
              onClick={() => onWeightChange(item.name, weightGrams - WEIGHT_STEP_GRAMS)}
              aria-label={`Diminuer ${item.name} de ${WEIGHT_STEP_GRAMS} grammes`}
            >
              <Minus size={15} />
            </button>
            <span className="min-w-16 text-center text-sm font-semibold text-grove">{formatWeight(weightGrams)}</span>
            <button
              type="button"
              className="grid h-8 w-8 place-items-center rounded-full text-grove transition hover:bg-white"
              onClick={() => onWeightChange(item.name, weightGrams + WEIGHT_STEP_GRAMS)}
              aria-label={`Augmenter ${item.name} de ${WEIGHT_STEP_GRAMS} grammes`}
            >
              <Plus size={15} />
            </button>
          </div>
          <p className="font-display text-lg font-semibold text-grove">{formatPrice(lineTotal, currency)}</p>
        </div>
      </div>
    </article>
  );
}
