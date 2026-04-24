import { Plus, Trash2 } from 'lucide-react';
import type { Product } from '../../api/types';
import { adminInputClass } from '../FormField';
import { money } from '../../utils/format';

export type PurchaseItemDraft = {
  product_id: string;
  quantity: string;
  unit_cost_ht: string;
  vat_rate: string;
};

export function emptyPurchaseItem(): PurchaseItemDraft {
  return {
    product_id: '',
    quantity: '1',
    unit_cost_ht: '0',
    vat_rate: '20',
  };
}

export function PurchaseItemsTable({
  items,
  products,
  onChange,
  onAdd,
  onRemove,
}: {
  items: PurchaseItemDraft[];
  products: Product[];
  onChange: (index: number, key: keyof PurchaseItemDraft, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <section className="rounded-3xl border border-grove/10 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-2xl font-semibold text-grove">Lignes produits</p>
          <p className="text-sm text-grove/60">Ajoutez les produits achetes, quantites, couts HT et TVA.</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={onAdd}>
          <Plus size={17} />
          Ajouter
        </button>
      </div>

      <div className="mt-5 grid gap-3">
        {items.map((item, index) => {
          const quantity = Number(item.quantity || 0);
          const unitCostHt = Number(item.unit_cost_ht || 0);
          const vatRate = Number(item.vat_rate || 0);
          const subtotalHt = quantity * unitCostHt;
          const subtotalTtc = subtotalHt * (1 + vatRate / 100);

          return (
            <article key={index} className="grid gap-3 rounded-3xl bg-cream p-4 lg:grid-cols-[1.5fr_repeat(4,minmax(0,0.7fr))_auto] lg:items-center">
              <select className={adminInputClass} value={item.product_id} onChange={(event) => onChange(index, 'product_id', event.target.value)}>
                <option value="">Choisir un produit</option>
                {products.map((product) => (
                  <option key={product.id} value={String(product.id)}>
                    {product.name}
                  </option>
                ))}
              </select>
              <input className={adminInputClass} type="number" min="0.001" step="0.001" value={item.quantity} onChange={(event) => onChange(index, 'quantity', event.target.value)} placeholder="Qte" />
              <input className={adminInputClass} type="number" min="0" step="0.01" value={item.unit_cost_ht} onChange={(event) => onChange(index, 'unit_cost_ht', event.target.value)} placeholder="Cout HT" />
              <input className={adminInputClass} type="number" min="0" step="0.01" value={item.vat_rate} onChange={(event) => onChange(index, 'vat_rate', event.target.value)} placeholder="TVA %" />
              <div className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-grove/70">
                <p>HT {money(subtotalHt)}</p>
                <p className="mt-1 font-display text-base text-grove">TTC {money(subtotalTtc)}</p>
              </div>
              <button type="button" className="inline-grid h-11 w-11 place-items-center rounded-full bg-tomato/10 text-tomato" onClick={() => onRemove(index)}>
                <Trash2 size={16} />
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
