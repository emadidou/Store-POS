import { useEffect, useMemo, useState } from 'react';
import type { Order } from '../../api/types';
import { adminApi } from '../../api/client';
import { adminInputClass, FormField } from '../FormField';
import { money } from '../../utils/format';

function toPositiveQuantity(value?: number) {
  return Math.abs(Number(value ?? 0));
}

export function CreditNoteModal({
  order,
  creditNotes,
  onClose,
  onCreated,
}: {
  order: Order | null;
  creditNotes: Order[];
  onClose: () => void;
  onCreated: (creditNote: Order) => void;
}) {
  const [mode, setMode] = useState<'full' | 'partial'>('full');
  const [reason, setReason] = useState('');
  const [restoreStock, setRestoreStock] = useState(true);
  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const remainingItems = useMemo(() => {
    if (!order?.items) return [];

    const creditedByProduct = new Map<number, number>();
    creditNotes.forEach((creditNote) => {
      (creditNote.items ?? []).forEach((item) => {
        creditedByProduct.set(item.product_id, (creditedByProduct.get(item.product_id) ?? 0) + toPositiveQuantity(item.quantity));
      });
    });

    return order.items
      .map((item) => {
        const orderedQuantity = Number(item.quantity ?? 0);
        const creditedQuantity = creditedByProduct.get(item.product_id) ?? 0;
        const remainingQuantity = Math.max(0, Number((orderedQuantity - creditedQuantity).toFixed(3)));
        const remainingRatio = orderedQuantity > 0 ? remainingQuantity / orderedQuantity : 0;
        const remainingAmount = Number(((item.subtotal_ttc ?? item.subtotal) * remainingRatio).toFixed(2));

        return {
          ...item,
          remainingQuantity,
          remainingAmount,
        };
      })
      .filter((item) => item.remainingQuantity > 0);
  }, [creditNotes, order]);

  const canCreateFull = creditNotes.length === 0;
  const refundableTotal = remainingItems.reduce((total, item) => total + item.remainingAmount, 0);

  useEffect(() => {
    setMode(canCreateFull ? 'full' : 'partial');
    setReason('');
    setRestoreStock(true);
    setQuantities({});
    setError('');
  }, [canCreateFull, order]);

  if (!order) return null;

  const submit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const items = mode === 'partial'
        ? remainingItems
          .map((item) => ({
            product_id: item.product_id,
            quantity: Number(quantities[item.product_id] ?? 0),
          }))
          .filter((item) => item.quantity > 0)
        : undefined;

      const created = await adminApi.createCreditNote(order.id, {
        reason,
        mode,
        restore_stock: restoreStock,
        items,
      });

      onCreated(created);
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Impossible de creer lavoir.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasSelection = mode === 'full'
    ? remainingItems.length > 0
    : remainingItems.some((item) => Number(quantities[item.product_id] ?? 0) > 0);

  return (
    <div className="fixed inset-0 z-[120000] grid place-items-center bg-grove/35 p-4 backdrop-blur-sm">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[1.75rem] bg-cream shadow-[0_24px_80px_rgba(31,77,54,0.24)]">
        <div className="flex items-start justify-between gap-4 border-b border-grove/10 px-6 pb-5 pt-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700">Remboursement</p>
            <h3 className="mt-2 font-display text-3xl font-semibold text-grove">Creer un avoir</h3>
            <p className="mt-2 text-sm text-grove/65">
              Facture {order.invoice_number ?? order.order_number} · total remboursable {money(refundableTotal)}
            </p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Fermer
          </button>
        </div>

        <div className="admin-modal-scroll min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Type davoir">
              <select className={adminInputClass} value={mode} onChange={(event) => setMode(event.target.value as 'full' | 'partial')}>
                {canCreateFull && <option value="full">Avoir total</option>}
                <option value="partial">Avoir partiel</option>
              </select>
            </FormField>

            <FormField label="Retour en stock">
              <select className={adminInputClass} value={restoreStock ? '1' : '0'} onChange={(event) => setRestoreStock(event.target.value === '1')}>
                <option value="1">Oui, remettre les produits en stock</option>
                <option value="0">Non, ne pas reintegrer le stock</option>
              </select>
            </FormField>

            <div className="md:col-span-2">
              <FormField label="Motif">
                <textarea
                  className={`${adminInputClass} min-h-[104px] resize-none`}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Annulation client, produit abime, erreur de caisse..."
                />
              </FormField>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-grove/10 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-display text-xl font-semibold text-grove">Lignes remboursables</p>
                <p className="text-sm text-grove/60">Le backend verifiera une seconde fois les quantites restantes.</p>
              </div>
              <p className="text-sm font-semibold text-grove/65">{remainingItems.length} ligne(s)</p>
            </div>

            <div className="mt-4 grid gap-3">
              {remainingItems.map((item) => (
                <article key={item.id} className="grid gap-3 rounded-2xl bg-cream p-4 md:grid-cols-[1.4fr_0.8fr_0.7fr] md:items-center">
                  <div>
                    <p className="font-semibold text-grove">{item.product_name_snapshot}</p>
                    <p className="text-sm text-grove/60">
                      Quantite restante {item.remainingQuantity} · Montant restant {money(item.remainingAmount)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-grove/70">P.U. {money(item.unit_price_ttc ?? item.unit_price)}</p>
                  <input
                    className={adminInputClass}
                    type="number"
                    min="0"
                    max={item.remainingQuantity}
                    step="0.001"
                    disabled={mode === 'full'}
                    value={mode === 'full' ? String(item.remainingQuantity) : (quantities[item.product_id] ?? '')}
                    onChange={(event) => setQuantities((current) => ({ ...current, [item.product_id]: event.target.value }))}
                    placeholder="0"
                  />
                </article>
              ))}
            </div>
          </div>

          {error && <p className="mt-4 rounded-2xl bg-tomato/10 px-4 py-3 text-sm font-semibold text-tomato">{error}</p>}
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-grove/10 bg-cream/95 px-6 py-5">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={submit}
            disabled={isSubmitting || !reason.trim() || !hasSelection || remainingItems.length === 0}
          >
            {isSubmitting ? 'Creation...' : 'Generer lavoir'}
          </button>
        </div>
      </div>
    </div>
  );
}
