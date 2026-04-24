import type { Product, Supplier } from '../../api/types';
import { adminInputClass, FormField } from '../FormField';
import { PurchaseAttachmentUploader } from './PurchaseAttachmentUploader';
import { PurchaseItemsTable, type PurchaseItemDraft } from './PurchaseItemsTable';
import { PurchaseSummary } from './PurchaseSummary';
import { SupplierSelect } from './SupplierSelect';

export type PurchaseFormState = {
  supplier_id: string;
  external_invoice_number: string;
  external_invoice_date: string;
  purchase_date: string;
  payment_status: string;
  payment_method: string;
  paid_at: string;
  notes: string;
  remove_attachment: boolean;
};

export const emptyPurchaseForm: PurchaseFormState = {
  supplier_id: '',
  external_invoice_number: '',
  external_invoice_date: '',
  purchase_date: new Date().toISOString().slice(0, 10),
  payment_status: 'unpaid',
  payment_method: '',
  paid_at: '',
  notes: '',
  remove_attachment: false,
};

export function PurchaseForm({
  form,
  items,
  suppliers,
  products,
  file,
  hasExistingAttachment,
  totals,
  onFieldChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onFileChange,
}: {
  form: PurchaseFormState;
  items: PurchaseItemDraft[];
  suppliers: Supplier[];
  products: Product[];
  file: File | null;
  hasExistingAttachment: boolean;
  totals: { subtotal_ht: number; total_vat: number; total_ttc: number };
  onFieldChange: (key: keyof PurchaseFormState, value: string | boolean) => void;
  onItemChange: (index: number, key: keyof PurchaseItemDraft, value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onFileChange: (file: File | null) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="grid gap-6">
        <section className="rounded-3xl border border-grove/10 bg-white p-5 shadow-soft">
          <p className="font-display text-2xl font-semibold text-grove">Informations achat</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <FormField label="Fournisseur">
              <SupplierSelect suppliers={suppliers} value={form.supplier_id} onChange={(value) => onFieldChange('supplier_id', value)} />
            </FormField>
            <FormField label="Date achat">
              <input className={adminInputClass} type="date" value={form.purchase_date} onChange={(event) => onFieldChange('purchase_date', event.target.value)} />
            </FormField>
            <FormField label="Numero facture fournisseur">
              <input className={adminInputClass} value={form.external_invoice_number} onChange={(event) => onFieldChange('external_invoice_number', event.target.value)} />
            </FormField>
            <FormField label="Date facture fournisseur">
              <input className={adminInputClass} type="date" value={form.external_invoice_date} onChange={(event) => onFieldChange('external_invoice_date', event.target.value)} />
            </FormField>
            <FormField label="Statut paiement">
              <select className={adminInputClass} value={form.payment_status} onChange={(event) => onFieldChange('payment_status', event.target.value)}>
                <option value="unpaid">Impayee</option>
                <option value="partial">Partielle</option>
                <option value="paid">Payee</option>
              </select>
            </FormField>
            <FormField label="Methode paiement">
              <input className={adminInputClass} value={form.payment_method} onChange={(event) => onFieldChange('payment_method', event.target.value)} placeholder="Virement, CB, cheque..." />
            </FormField>
            <FormField label="Date paiement">
              <input className={adminInputClass} type="datetime-local" value={form.paid_at} onChange={(event) => onFieldChange('paid_at', event.target.value)} />
            </FormField>
            <div className="md:col-span-2">
              <PurchaseAttachmentUploader
                file={file}
                hasExistingAttachment={hasExistingAttachment}
                removeExisting={form.remove_attachment}
                onFileChange={onFileChange}
                onRemoveExistingChange={(value) => onFieldChange('remove_attachment', value)}
              />
            </div>
            <div className="md:col-span-2">
              <FormField label="Notes">
                <textarea className={`${adminInputClass} min-h-[120px] resize-none`} value={form.notes} onChange={(event) => onFieldChange('notes', event.target.value)} />
              </FormField>
            </div>
          </div>
        </section>

        <PurchaseItemsTable items={items} products={products} onChange={onItemChange} onAdd={onAddItem} onRemove={onRemoveItem} />
      </div>

      <div className="grid gap-6">
        <PurchaseSummary subtotalHt={totals.subtotal_ht} totalVat={totals.total_vat} totalTtc={totals.total_ttc} />
      </div>
    </div>
  );
}
