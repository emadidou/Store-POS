import { Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../api/client';
import type { Order, OrderStatus, Product } from '../api/types';
import { ErrorState } from '../components/ErrorState';
import { adminInputClass, FormField } from '../components/FormField';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';

const statuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'cancelled'];

const emptyForm = {
  full_name: '',
  phone: '',
  email: '',
  pickup_date: new Date().toISOString().slice(0, 10),
  pickup_time: '15:00',
  payment_method: 'cash',
  payment_captured: false,
  source: 'admin',
  order_type: 'pickup',
  status: 'pending' as OrderStatus,
  notes: '',
};

type OrderLineForm = {
  product_id: string;
  quantity: number;
};

export function OrderFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState<OrderLineForm[]>([{ product_id: '', quantity: 1 }]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.products().then(setProducts).catch((loadError) => {
      setLoadError(loadError instanceof Error ? loadError.message : 'Impossible de charger les produits.');
    });

    if (!id) {
      setIsLoading(false);
      return;
    }

    adminApi.order(id)
      .then((order) => {
        setForm(fromOrder(order));
        setItems((order.items ?? []).map((item) => ({ product_id: String(item.product_id), quantity: item.quantity })));
      })
      .catch((loadError) => {
        setLoadError(loadError instanceof Error ? loadError.message : 'Impossible de charger la commande.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  const update = (key: keyof typeof emptyForm, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  const updateItem = (index: number, next: Partial<OrderLineForm>) => {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...next } : item));
  };

  const removeItem = (index: number) => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const cleanItems = items
      .filter((item) => item.product_id && item.quantity > 0)
      .map((item) => ({ product_id: Number(item.product_id), quantity: Number(item.quantity) }));

    if (!form.full_name.trim() || !form.phone.trim() || cleanItems.length === 0) {
      setError('Le client et au moins un produit sont obligatoires.');
      return;
    }

    setIsSaving(true);

    try {
      await adminApi.saveOrder({
        customer: {
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || null,
        },
        pickup_date: form.pickup_date,
        pickup_time: form.pickup_time,
        payment_method: form.payment_method,
        payment_captured: form.payment_captured,
        status: form.status,
        notes: form.notes.trim() || null,
        source: form.source,
        order_type: form.order_type,
        items: cleanItems,
      }, id);

      navigate('/admin/orders');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Impossible d'enregistrer la commande.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loadError && !isLoading && id) return <ErrorState title="Commande indisponible" description={loadError} />;
  if (isLoading) return <LoadingState label="Chargement de la commande..." />;

  return (
    <>
      <PageHeader title={id ? 'Modifier la commande' : 'Ajouter une commande'} description="Creez ou ajustez une commande avec recalcul automatique du total cote backend." />
      <form onSubmit={submit} className="grid gap-6 rounded-[1.5rem] border border-grove/10 bg-white p-5 shadow-soft">
        <section className="grid gap-5 lg:grid-cols-3">
          <FormField label="Client"><input className={adminInputClass} value={form.full_name} onChange={(event) => update('full_name', event.target.value)} /></FormField>
          <FormField label="Telephone"><input className={adminInputClass} value={form.phone} onChange={(event) => update('phone', event.target.value)} /></FormField>
          <FormField label="Email"><input className={adminInputClass} type="email" value={form.email} onChange={(event) => update('email', event.target.value)} /></FormField>
          <FormField label="Date retrait"><input className={adminInputClass} type="date" value={form.pickup_date} onChange={(event) => update('pickup_date', event.target.value)} /></FormField>
          <FormField label="Heure retrait"><input className={adminInputClass} type="time" value={form.pickup_time} onChange={(event) => update('pickup_time', event.target.value)} /></FormField>
          <FormField label="Paiement">
            <select className={adminInputClass} value={form.payment_method} onChange={(event) => update('payment_method', event.target.value)}>
              <option value="cash">Especes</option>
              <option value="stripe">Carte / TPE</option>
              <option value="stripe_later_ready">Paiement a la reception</option>
            </select>
          </FormField>
          <FormField label="Encaissement">
            <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-grove/10 bg-cream px-4 text-sm font-semibold text-grove">
              <input
                type="checkbox"
                checked={form.payment_captured}
                onChange={(event) => update('payment_captured', event.target.checked)}
              />
              Paiement confirme par le vendeur
            </label>
          </FormField>
          <FormField label="Statut commande">
            <select className={adminInputClass} value={form.status} onChange={(event) => update('status', event.target.value as OrderStatus)}>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </FormField>
          <FormField label="Source">
            <select className={adminInputClass} value={form.source} onChange={(event) => update('source', event.target.value)}>
              <option value="admin">Admin</option>
              <option value="web">En ligne</option>
              <option value="pos">POS caisse</option>
            </select>
          </FormField>
          <FormField label="Type commande">
            <select className={adminInputClass} value={form.order_type} onChange={(event) => update('order_type', event.target.value)}>
              <option value="pickup">Retrait</option>
              <option value="reservation">Reservation</option>
              <option value="in_store">Sur place</option>
            </select>
          </FormField>
          <FormField label="Notes"><textarea className={`${adminInputClass} min-h-24 lg:col-span-2`} value={form.notes} onChange={(event) => update('notes', event.target.value)} /></FormField>
        </section>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold text-grove">Produits</h2>
            <button type="button" className="btn btn-secondary" onClick={() => setItems((current) => [...current, { product_id: '', quantity: 1 }])}>
              <Plus size={17} />
              Ajouter une ligne
            </button>
          </div>
          <div className="grid gap-3">
            {items.map((item, index) => (
              <div key={index} className="grid gap-3 rounded-2xl bg-cream p-4 sm:grid-cols-[1fr_160px_auto]">
                <select className={adminInputClass} value={item.product_id} onChange={(event) => updateItem(index, { product_id: event.target.value })}>
                  <option value="">Selectionner un produit</option>
                  {products.map((product) => <option key={product.id} value={product.id}>{product.name} - stock {product.stock}</option>)}
                </select>
                <input className={adminInputClass} type="number" min="0.001" step="0.001" value={item.quantity} onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })} />
                <button type="button" className="rounded-full bg-tomato/10 px-4 py-2 text-tomato" onClick={() => removeItem(index)} aria-label="Supprimer la ligne">
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {(error || loadError) && <p className="rounded-2xl bg-tomato/10 p-3 text-sm font-semibold text-tomato">{error || loadError}</p>}
        <button className="btn btn-primary w-max" disabled={isSaving} type="submit"><Save size={17} /> {isSaving ? 'Enregistrement...' : 'Enregistrer'}</button>
      </form>
    </>
  );
}

function fromOrder(order: Order) {
  return {
    full_name: order.customer.full_name,
    phone: order.customer.phone,
    email: order.customer.email ?? '',
    pickup_date: order.pickup_date,
    pickup_time: order.pickup_time,
    payment_method: order.payment_method,
    payment_captured: String(order.payment_status ?? (order.is_paid ? 'paid' : 'pending')) === 'paid',
    source: order.source ?? 'admin',
    order_type: order.order_type ?? 'pickup',
    status: order.status,
    notes: order.notes ?? '',
  };
}
