import { motion } from 'framer-motion';
import { CheckCircle2, CreditCard, Download, Store, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ApiError } from '../api/client';
import { createOrder } from '../api/orders';
import { getBusinessHours, getPickupSlots, getStoreStatus } from '../api/store';
import { formatPrice, formatUnitPrice, formatWeight, getLineTotal, getOrderTotals, getWeightGrams } from '../utils/order.js';

const today = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const initialForm = {
  fullName: '',
  phone: '',
  email: '',
  note: '',
  pickupDate: today(),
  pickupTime: '',
  paymentMethod: 'cash',
};

const phoneRegex = /^[+()\d\s.-]{8,}$/;

function getDayOfWeek(dateValue) {
  if (!dateValue) return null;
  const [year, month, day] = dateValue.split('-').map(Number);
  return new Date(year, month - 1, day).getDay();
}

function toMinutes(time) {
  const [hours = '0', minutes = '0'] = String(time).split(':');
  return (Number.parseInt(hours, 10) * 60) + Number.parseInt(minutes, 10);
}

function formatTime(totalMinutes) {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const minutes = String(totalMinutes % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function buildTimeOptions(dateValue, slots, businessHours, pickupBufferMinutes = 0) {
  const dayOfWeek = getDayOfWeek(dateValue);
  if (dayOfWeek === null) return [];

  const businessHour = businessHours.find((hour) => hour.day_of_week === dayOfWeek);
  if (businessHour?.is_closed) {
    return [];
  }

  const minimumMinutes = dateValue === today()
    ? (() => {
        const now = new Date();
        const buffered = new Date(now.getTime() + pickupBufferMinutes * 60_000);
        buffered.setMinutes(Math.ceil(buffered.getMinutes() / 15) * 15, 0, 0);
        return buffered.getHours() * 60 + buffered.getMinutes();
      })()
    : 0;

  const options = [];
  const daySlots = slots.filter((slot) => slot.day_of_week === dayOfWeek);

  daySlots.forEach((slot) => {
    const start = Math.max(toMinutes(slot.start_time), minimumMinutes);
    const end = toMinutes(slot.end_time);

    for (let current = start; current < end; current += 15) {
      const value = formatTime(current);

      if (!options.some((option) => option.value === value)) {
        options.push({
          value,
          label: `${value} (${slot.start_time}-${slot.end_time})`,
        });
      }
    }
  });

  return options.sort((first, second) => first.value.localeCompare(second.value));
}

function formatDateTime(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function CheckoutPage({ currency, items, storeSettings, onClearCart = () => {}, onNavigate }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [storeContext, setStoreContext] = useState({
    isLoading: true,
    error: '',
    status: null,
    pickupSlots: [],
    businessHours: [],
  });
  const totals = useMemo(() => getOrderTotals(items), [items]);
  const pickupOptions = useMemo(
    () => buildTimeOptions(form.pickupDate, storeContext.pickupSlots, storeContext.businessHours, storeSettings?.pickup_buffer_minutes ?? 0),
    [form.pickupDate, storeContext.businessHours, storeContext.pickupSlots, storeSettings?.pickup_buffer_minutes],
  );

  useEffect(() => {
    let isMounted = true;

    Promise.all([getStoreStatus(), getPickupSlots(), getBusinessHours()])
      .then(([status, pickupSlots, businessHours]) => {
        if (!isMounted) return;
        setStoreContext({
          isLoading: false,
          error: '',
          status,
          pickupSlots,
          businessHours,
        });
      })
      .catch(() => {
        if (!isMounted) return;
        setStoreContext((current) => ({
          ...current,
          isLoading: false,
          error: 'Impossible de charger les horaires et creneaux de retrait pour le moment.',
        }));
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (pickupOptions.length === 0) {
      setForm((current) => (current.pickupTime ? { ...current, pickupTime: '' } : current));
      return;
    }

    setForm((current) => (
      pickupOptions.some((option) => option.value === current.pickupTime)
        ? current
        : { ...current, pickupTime: pickupOptions[0].value }
    ));
  }, [pickupOptions]);

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.fullName.trim()) nextErrors.fullName = 'Le nom complet est requis.';
    if (!form.phone.trim()) {
      nextErrors.phone = 'Le telephone est requis.';
    } else if (!phoneRegex.test(form.phone.trim())) {
      nextErrors.phone = 'Le telephone semble invalide.';
    }
    if (!form.pickupDate) nextErrors.pickupDate = 'Choisissez une date de retrait.';
    if (!form.pickupTime) {
      nextErrors.pickupTime = 'Choisissez une heure de retrait.';
    } else if (!pickupOptions.some((option) => option.value === form.pickupTime)) {
      nextErrors.pickupTime = 'Choisissez un creneau de retrait valide.';
    }
    if (items.length === 0) nextErrors.items = 'Votre commande est vide.';
    if (items.some((item) => !item.id)) nextErrors.items = 'Certains produits ne sont pas connectes au backend. Rechargez la page puis reessayez.';
    if (storeContext.status && !storeContext.status.is_open) nextErrors.submit = storeContext.status.message || 'Le magasin est actuellement ferme.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const orderItems = items.map((item) => ({
        product_id: Number(item.id),
        quantity: Number((getWeightGrams(item) / 1000).toFixed(3)),
      }));

      const createdOrder = await createOrder({
        customer: {
          full_name: form.fullName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
        },
        pickup_date: form.pickupDate,
        pickup_time: form.pickupTime,
        payment_method: form.paymentMethod,
        notes: form.note.trim() || undefined,
        items: orderItems,
      });

      setConfirmedOrder({
        customer: form,
        items,
        totals,
        reference: createdOrder.order_number,
        backendOrder: createdOrder,
      });
      onClearCart();
    } catch (error) {
      setErrors((current) => ({ ...current, submit: getOrderErrorMessage(error) }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmedOrder) {
    return <ConfirmationBlock currency={currency} order={confirmedOrder} onNavigate={onNavigate} />;
  }

  const isStoreClosed = Boolean(storeContext.status && !storeContext.status.is_open);
  const selectedBusinessHour = storeContext.businessHours.find((hour) => hour.day_of_week === getDayOfWeek(form.pickupDate));

  return (
    <section className="min-h-screen bg-cream pb-20 pt-28 sm:pt-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <p className="eyebrow">Checkout</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-normal text-grove sm:text-5xl">
            Finalisez votre commande
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-grove/70">
            Indiquez vos informations et choisissez un creneau valide. Le checkout suit les horaires et l etat reel du magasin.
          </p>
        </motion.div>

        {storeContext.error && (
          <div className="mb-6 rounded-2xl border border-tomato/20 bg-white p-4 text-sm font-semibold text-tomato">
            {storeContext.error}
          </div>
        )}

        {storeContext.status && (
          <div className={`mb-6 rounded-2xl border p-4 text-sm font-semibold ${storeContext.status.is_open ? 'border-leaf-200 bg-white text-leaf-800' : 'border-tomato/20 bg-white text-tomato'}`}>
            {storeContext.status.message}
            {storeContext.status.is_open && storeContext.status.closes_at ? ` - fermeture a ${formatDateTime(storeContext.status.closes_at).split(' ').slice(-1)[0]}` : ''}
            {!storeContext.status.is_open && storeContext.status.opens_at ? ` - prochaine ouverture le ${formatDateTime(storeContext.status.opens_at)}` : ''}
          </div>
        )}

        {errors.items && (
          <div className="mb-6 rounded-2xl border border-tomato/20 bg-white p-4 text-sm font-semibold text-tomato">
            {errors.items}{' '}
            <button type="button" className="underline" onClick={() => onNavigate('/produits')}>
              Ajouter des produits
            </button>
          </div>
        )}

        {errors.submit && (
          <div className="mb-6 rounded-2xl border border-tomato/20 bg-white p-4 text-sm font-semibold text-tomato">
            {errors.submit}
          </div>
        )}

        <form className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-start" onSubmit={handleSubmit}>
          <div className="grid gap-5">
            <CheckoutForm form={form} errors={errors} onChange={updateField} />
            <PickupSelector
              businessHour={selectedBusinessHour}
              dateValue={form.pickupDate}
              dateError={errors.pickupDate}
              isLoading={storeContext.isLoading}
              options={pickupOptions}
              timeValue={form.pickupTime}
              timeError={errors.pickupTime}
              onChange={updateField}
            />
            <PaymentMethod value={form.paymentMethod} onChange={updateField} />
            <button type="submit" className="btn btn-primary justify-center" disabled={isSubmitting || storeContext.isLoading || isStoreClosed || pickupOptions.length === 0}>
              {isSubmitting ? 'Confirmation...' : 'Confirmer ma commande'}
              <CheckCircle2 size={18} />
            </button>
          </div>

          <OrderSummary currency={currency} items={items} totals={totals} />
        </form>
      </div>
    </section>
  );
}

export function CheckoutForm({ errors, form, onChange }) {
  return (
    <section className="rounded-[1.5rem] border border-grove/10 bg-white p-5 shadow-soft sm:p-7">
      <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-grove">
        <UserRound size={22} />
        Informations client
      </h2>
      <div className="mt-6 grid gap-4">
        <Field label="Nom complet" error={errors.fullName}>
          <input
            type="text"
            value={form.fullName}
            onChange={(event) => onChange('fullName', event.target.value)}
            placeholder="Votre nom complet"
            autoComplete="name"
            aria-invalid={Boolean(errors.fullName)}
          />
        </Field>
        <Field label="Telephone" error={errors.phone}>
          <input
            type="tel"
            value={form.phone}
            onChange={(event) => onChange('phone', event.target.value)}
            placeholder="+33 6 12 34 56 78"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
          />
        </Field>
        <Field label="Email optionnel">
          <input
            type="email"
            value={form.email}
            onChange={(event) => onChange('email', event.target.value)}
            placeholder="vous@email.com"
            autoComplete="email"
          />
        </Field>
        <Field label="Note ou instruction speciale">
          <textarea
            rows="4"
            value={form.note}
            onChange={(event) => onChange('note', event.target.value)}
            placeholder="Exemple : fruits murs, panier separe..."
          />
        </Field>
      </div>
    </section>
  );
}

export function PickupSelector({ businessHour, dateError, dateValue, isLoading, onChange, options, timeError, timeValue }) {
  return (
    <section className="rounded-[1.5rem] border border-grove/10 bg-white p-5 shadow-soft sm:p-7">
      <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-grove">
        <Store size={22} />
        Retrait en magasin
      </h2>
      <div className="mt-6">
        <Field label="Date de retrait" error={dateError}>
          <input
            type="date"
            min={today()}
            value={dateValue}
            onChange={(event) => onChange('pickupDate', event.target.value)}
            aria-invalid={Boolean(dateError)}
          />
        </Field>
        <div className="mt-4">
          <Field label="Heure de retrait" error={timeError}>
            <select
              value={timeValue}
              onChange={(event) => onChange('pickupTime', event.target.value)}
              aria-invalid={Boolean(timeError)}
              disabled={isLoading || options.length === 0}
            >
              <option value="">{isLoading ? 'Chargement des creneaux...' : 'Choisissez un creneau'}</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </Field>
        </div>
        <p className="mt-4 rounded-2xl bg-leaf-50 p-4 text-sm font-semibold leading-6 text-leaf-800">
          {businessHour?.is_closed
            ? 'Le magasin est ferme ce jour-la.'
            : businessHour?.open_time && businessHour?.close_time
              ? `Retrait possible entre ${businessHour.open_time} et ${businessHour.close_time}.`
              : 'Votre commande sera prete a l heure choisie.'}
        </p>
      </div>
    </section>
  );
}

export function PaymentMethod({ onChange, value }) {
  return (
    <section className="rounded-[1.5rem] border border-grove/10 bg-white p-5 shadow-soft sm:p-7">
      <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-grove">
        <CreditCard size={22} />
        Mode de paiement
      </h2>
      <div className="mt-6 grid gap-3">
        <RadioCard
          checked={value === 'cash'}
          label="Paiement a la reception"
          description="Reglez votre commande lors du retrait en magasin."
          onChange={() => onChange('paymentMethod', 'cash')}
        />
        <RadioCard
          checked={value === 'stripe'}
          label="Paiement en ligne"
          description="Desactive pour le moment. Le paiement en ligne n est pas encore disponible."
          disabled
          onChange={() => onChange('paymentMethod', 'stripe')}
        />
      </div>
    </section>
  );
}

export function OrderSummary({ currency, items, totals }) {
  return (
    <aside className="rounded-[1.5rem] border border-grove/10 bg-white p-5 shadow-soft sm:p-7 lg:sticky lg:top-24">
      <h2 className="font-display text-2xl font-semibold text-grove">Resume de commande</h2>
      <p className="mt-2 text-sm font-medium text-grove/60">
        {totals.itemCount} article{totals.itemCount > 1 ? 's' : ''} - {formatWeight(totals.totalWeight)}
      </p>

      <div className="mt-6 grid gap-3">
        {items.length > 0 ? (
          items.map((item) => (
            <article key={item.name} className="grid grid-cols-[64px_1fr] gap-3 rounded-2xl bg-cream p-3">
              <img src={item.image} alt={item.name} className="h-16 w-full rounded-xl object-cover" loading="lazy" />
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-semibold text-grove">{item.name}</h3>
                    <p className="mt-1 text-xs font-medium text-grove/55">
                      {formatWeight(getWeightGrams(item))} - {formatUnitPrice(item.priceValue ?? 0, currency)}
                    </p>
                  </div>
                  <p className="shrink-0 font-display text-base font-semibold text-grove">
                    {formatPrice(getLineTotal(item), currency)}
                  </p>
                </div>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-2xl bg-cream p-4 text-sm font-medium text-grove/65">
            Aucun produit selectionne pour le moment.
          </p>
        )}
      </div>

      <div className="mt-6 border-t border-grove/10 pt-5">
        <div className="flex items-center justify-between text-sm font-medium text-grove/65">
          <span>Sous-total</span>
          <span>{formatPrice(totals.total, currency)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between font-display text-2xl font-semibold text-grove">
          <span>Total</span>
          <span>{formatPrice(totals.total, currency)}</span>
        </div>
      </div>
    </aside>
  );
}

export function ConfirmationBlock({ currency, onNavigate, order }) {
  const voucherUrl =
    order.backendOrder?.document_type === 'order_voucher' && order.backendOrder?.voucher_token
      ? `/order-success/${encodeURIComponent(order.backendOrder.order_number)}?token=${encodeURIComponent(order.backendOrder.voucher_token)}`
      : '';

  return (
    <section className="min-h-screen bg-cream pb-20 pt-28 sm:pt-32">
      <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8">
        <motion.div
          className="rounded-[2rem] border border-grove/10 bg-white p-6 text-center shadow-soft sm:p-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-leaf-50 text-leaf-700">
            <CheckCircle2 size={30} strokeWidth={1.7} />
          </span>
          <p className="eyebrow mt-6 justify-center">Commande confirmee</p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-grove">
            Votre commande est en cours de preparation
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-grove/70">
            Merci {order.customer.fullName}. Votre commande {order.reference} sera prete a partir de{' '}
            <strong>{order.backendOrder?.pickup_time ?? order.customer.pickupTime}</strong>. L equipe la prepare avec soin avant votre arrivee.
          </p>

          <div className="mt-8 text-left">
            <OrderSummary currency={currency} items={order.items} totals={order.totals} />
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {voucherUrl && (
              <button type="button" className="btn btn-primary justify-center" onClick={() => onNavigate(voucherUrl)}>
                Telecharger mon bon de commande
                <Download size={18} />
              </button>
            )}
            <button type="button" className="btn btn-primary justify-center" onClick={() => onNavigate('/')}>
              Retour a l accueil
            </button>
            <button type="button" className="btn btn-secondary justify-center" onClick={() => onNavigate('/produits')}>
              Commander autre chose
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Field({ children, error, label }) {
  return (
    <label className="form-field">
      {label}
      {children}
      {error && <span className="text-sm font-semibold text-tomato">{error}</span>}
    </label>
  );
}

function getOrderErrorMessage(error) {
  if (error instanceof ApiError) {
    const firstValidationError = Object.values(error.errors)?.[0]?.[0];
    return firstValidationError ?? error.message;
  }

  return 'Impossible de confirmer la commande pour le moment. Merci de reessayer.';
}

function RadioCard({ checked, description, disabled = false, label, onChange }) {
  return (
    <label
      className={`flex items-start gap-3 rounded-2xl border p-4 transition ${
        checked ? 'border-leaf-500 bg-leaf-50' : 'border-grove/10 bg-cream'
      } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-white'}`}
    >
      <input
        type="radio"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="mt-1 h-4 w-4 accent-grove"
      />
      <span>
        <span className="block font-semibold text-grove">{label}</span>
        <span className="mt-1 block text-sm leading-6 text-grove/62">{description}</span>
      </span>
    </label>
  );
}
