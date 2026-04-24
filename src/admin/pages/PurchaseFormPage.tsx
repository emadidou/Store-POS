import { Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../api/client';
import type { Product, Purchase, Supplier } from '../api/types';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { PurchaseForm, emptyPurchaseForm, type PurchaseFormState } from '../components/purchases/PurchaseForm';
import { computePurchaseTotals } from '../components/purchases/PurchaseSummary';
import { emptyPurchaseItem, type PurchaseItemDraft } from '../components/purchases/PurchaseItemsTable';

export function PurchaseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<PurchaseFormState>(emptyPurchaseForm);
  const [items, setItems] = useState<PurchaseItemDraft[]>([emptyPurchaseItem()]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      adminApi.suppliers(),
      adminApi.products(),
      id ? adminApi.purchase(id) : Promise.resolve(null),
    ])
      .then(([supplierRows, productRows, purchaseRow]) => {
        setSuppliers(supplierRows.filter((supplier) => supplier.is_active || supplier.id === purchaseRow?.supplier_id));
        setProducts(productRows);

        if (purchaseRow) {
          setPurchase(purchaseRow);
          setForm({
            supplier_id: purchaseRow.supplier_id ? String(purchaseRow.supplier_id) : '',
            external_invoice_number: purchaseRow.external_invoice_number ?? '',
            external_invoice_date: purchaseRow.external_invoice_date ?? '',
            purchase_date: purchaseRow.purchase_date,
            payment_status: purchaseRow.payment_status,
            payment_method: purchaseRow.payment_method ?? '',
            paid_at: purchaseRow.paid_at ? purchaseRow.paid_at.slice(0, 16) : '',
            notes: purchaseRow.notes ?? '',
            remove_attachment: false,
          });
          setItems((purchaseRow.items ?? []).map((item) => ({
            product_id: String(item.product_id),
            quantity: String(item.quantity),
            unit_cost_ht: String(item.unit_cost_ht),
            vat_rate: String(item.vat_rate),
          })));
        }
      })
      .catch((loadError) => setLoadError(loadError instanceof Error ? loadError.message : "Impossible de charger l'achat."))
      .finally(() => setIsLoading(false));
  }, [id]);

  const totals = useMemo(() => computePurchaseTotals(items.map((item) => ({
    quantity: Number(item.quantity || 0),
    unit_cost_ht: Number(item.unit_cost_ht || 0),
    vat_rate: Number(item.vat_rate || 0),
  }))), [items]);

  const updateField = (key: keyof PurchaseFormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateItem = (index: number, key: keyof PurchaseItemDraft, value: string) => {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  };

  const addItem = () => setItems((current) => [...current, emptyPurchaseItem()]);
  const removeItem = (index: number) => setItems((current) => current.length === 1 ? current : current.filter((_, itemIndex) => itemIndex !== index));

  const submit = async (status: 'draft' | 'confirmed') => {
    setError('');

    const normalizedItems = items
      .filter((item) => item.product_id)
      .map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity || 0),
        unit_cost_ht: Number(item.unit_cost_ht || 0),
        vat_rate: Number(item.vat_rate || 0),
      }))
      .filter((item) => item.product_id && item.quantity > 0);

    if (!form.purchase_date) {
      setError("La date d'achat est obligatoire.");
      return;
    }

    if (status === 'confirmed' && normalizedItems.length === 0) {
      setError('Ajoutez au moins une ligne produit avant de confirmer un achat.');
      return;
    }

    try {
      const saved = await adminApi.savePurchase({
        supplier_id: form.supplier_id || null,
        external_invoice_number: form.external_invoice_number || null,
        external_invoice_date: form.external_invoice_date || null,
        purchase_date: form.purchase_date,
        payment_status: form.payment_status,
        payment_method: form.payment_method || null,
        paid_at: form.paid_at || null,
        notes: form.notes || null,
        remove_attachment: form.remove_attachment,
        attachment,
        items: normalizedItems,
        status,
      }, id);

      navigate(`/admin/purchases/${saved.id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Impossible d'enregistrer l'achat.");
    }
  };

  const cancelPurchase = async () => {
    if (!id) {
      navigate('/admin/purchases');
      return;
    }

    try {
      await adminApi.updatePurchaseStatus(id, 'cancelled');
      navigate(`/admin/purchases/${id}`);
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : 'Annulation impossible.');
    }
  };

  if (loadError && !isLoading) return <ErrorState title="Achat indisponible" description={loadError} />;
  if (isLoading) return <LoadingState label="Chargement de l'achat..." />;
  if (purchase && purchase.status !== 'draft') {
    return <ErrorState title="Edition impossible" description="Seuls les achats en brouillon peuvent etre modifies. Passez par la page detail pour confirmer ou annuler cet achat." />;
  }

  return (
    <>
      <PageHeader
        title={id ? `Modifier ${purchase?.purchase_number ?? "l'achat"}` : 'Nouvel achat fournisseur'}
        description="Saisissez les achats, les factures externes et confirmez l'entree en stock au bon moment."
      />
      <div className="grid gap-5">
        <PurchaseForm
          form={form}
          items={items}
          suppliers={suppliers}
          products={products}
          file={attachment}
          hasExistingAttachment={Boolean(purchase?.has_attachment)}
          totals={totals}
          onFieldChange={updateField}
          onItemChange={updateItem}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onFileChange={setAttachment}
        />
        {error && <p className="rounded-2xl bg-tomato/10 p-3 text-sm font-semibold text-tomato">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn btn-secondary" onClick={() => submit('draft')}>
            <Save size={17} />
            Enregistrer brouillon
          </button>
          <button type="button" className="btn btn-primary" onClick={() => submit('confirmed')}>
            <Save size={17} />
            Confirmer achat
          </button>
          <button type="button" className="btn btn-secondary text-tomato" onClick={cancelPurchase}>
            Annuler
          </button>
        </div>
      </div>
    </>
  );
}
