import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../api/client';
import type { Product } from '../../api/types';
import { adminInputClass, FormField } from '../FormField';

type StockAdjustMode = 'in' | 'out' | 'adjustment';

const labels: Record<StockAdjustMode, { title: string; button: string; placeholder: string }> = {
  in: { title: 'Ajouter du stock', button: 'Ajouter', placeholder: 'Livraison, retour...' },
  out: { title: 'Retirer du stock', button: 'Retirer', placeholder: 'Casse, perte, commande...' },
  adjustment: { title: 'Corriger le stock', button: 'Corriger', placeholder: 'Inventaire, correction...' },
};

export function StockAdjustModal({
  product,
  mode,
  onClose,
  onSaved,
}: {
  product: Product | null;
  mode: StockAdjustMode | null;
  onClose: () => void;
  onSaved: (product: Product) => void;
}) {
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [threshold, setThreshold] = useState(product?.alert_threshold?.toString() ?? '');
  const [isAvailable, setIsAvailable] = useState(product?.is_available ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const content = useMemo(() => (mode ? labels[mode] : null), [mode]);

  useEffect(() => {
    setQuantity(mode === 'adjustment' ? String(product?.stock ?? '') : '');
    setReason('');
    setNote('');
    setThreshold(product?.alert_threshold?.toString() ?? '');
    setIsAvailable(product?.is_available ?? true);
    setError('');
  }, [mode, product]);

  if (!product || !mode || !content) return null;

  const submit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      let updatedProduct = product;

      if (mode === 'adjustment') {
        updatedProduct = await adminApi.updateProductStock(product.id, {
          stock: Number(quantity || product.stock),
          alert_threshold: threshold !== '' ? Number(threshold) : product.alert_threshold,
          is_available: isAvailable,
          reason: reason || 'Correction manuelle',
          note: note || undefined,
        });
      } else {
        updatedProduct = await adminApi.adjustStock({
          product_id: product.id,
          type: mode,
          quantity: Number(quantity),
          reason: reason || content.placeholder,
          source: 'admin',
          note: note || undefined,
        });

        updatedProduct = await adminApi.updateProductStock(product.id, {
          alert_threshold: threshold !== '' ? Number(threshold) : product.alert_threshold,
          is_available: isAvailable,
        });
      }

      onSaved(updatedProduct);
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Impossible de mettre a jour le stock.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120000] grid place-items-center bg-grove/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[1.75rem] bg-cream p-6 shadow-[0_24px_80px_rgba(31,77,54,0.24)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700">Gestion stock</p>
            <h3 className="mt-2 font-display text-3xl font-semibold text-grove">{content.title}</h3>
            <p className="mt-2 text-sm text-grove/65">{product.name} · stock actuel {product.stock}</p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Fermer
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <FormField label={mode === 'adjustment' ? 'Nouveau stock' : 'Quantite'}>
            <input
              className={adminInputClass}
              type="number"
              min="0"
              step="0.001"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder={mode === 'adjustment' ? String(product.stock) : '0'}
            />
          </FormField>

          <FormField label="Seuil d'alerte">
            <input className={adminInputClass} type="number" min="0" step="0.001" value={threshold} onChange={(event) => setThreshold(event.target.value)} />
          </FormField>

          <FormField label="Raison">
            <input className={adminInputClass} value={reason} onChange={(event) => setReason(event.target.value)} placeholder={content.placeholder} />
          </FormField>

          <FormField label="Disponibilite">
            <select className={adminInputClass} value={isAvailable ? '1' : '0'} onChange={(event) => setIsAvailable(event.target.value === '1')}>
              <option value="1">Disponible</option>
              <option value="0">Indisponible</option>
            </select>
          </FormField>

          <div className="md:col-span-2">
            <FormField label="Note">
              <textarea className={`${adminInputClass} min-h-[112px] resize-none`} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ajoutez un contexte si necessaire..." />
            </FormField>
          </div>
        </div>

        {error && <p className="mt-4 rounded-2xl bg-tomato/10 px-4 py-3 text-sm font-semibold text-tomato">{error}</p>}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </button>
          <button type="button" className="btn btn-primary" onClick={submit} disabled={isSubmitting || quantity === ''}>
            {content.button}
          </button>
        </div>
      </div>
    </div>
  );
}
