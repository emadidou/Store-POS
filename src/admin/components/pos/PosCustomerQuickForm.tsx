import type { PosCustomer, PosOrderType } from '../../types/pos';

const inputClass = 'h-11 rounded-2xl border border-grove/10 bg-cream px-3 text-sm font-semibold text-grove outline-none focus:border-leaf-500 focus:bg-white focus:ring-4 focus:ring-leaf-100';

export function PosCustomerQuickForm({
  customer,
  onChange,
  onOrderTypeChange,
  orderType,
}: {
  customer: PosCustomer;
  orderType: PosOrderType;
  onChange: (customer: PosCustomer) => void;
  onOrderTypeChange: (type: PosOrderType) => void;
}) {
  const patch = (key: keyof PosCustomer, value: string) => onChange({ ...customer, [key]: value });

  return (
    <section className="grid gap-3 rounded-3xl border border-grove/10 bg-white p-4">
      <div className="grid grid-cols-3 gap-2">
        {[
          ['in_store', 'Sur place'],
          ['pickup', 'Retrait'],
          ['reservation', 'Reservation'],
        ].map(([value, label]) => (
          <button key={value} type="button" className={modeClass(orderType === value)} onClick={() => onOrderTypeChange(value as PosOrderType)}>
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <input className={inputClass} placeholder="Nom client optionnel" value={customer.full_name} onChange={(event) => patch('full_name', event.target.value)} />
        <input className={inputClass} placeholder="Telephone optionnel" value={customer.phone} onChange={(event) => patch('phone', event.target.value)} />
        <input className={inputClass} placeholder="Email optionnel" value={customer.email} onChange={(event) => patch('email', event.target.value)} />
        <input className={inputClass} placeholder="Notes rapides" value={customer.notes} onChange={(event) => patch('notes', event.target.value)} />
      </div>
    </section>
  );
}

function modeClass(active: boolean) {
  return `rounded-2xl px-3 py-2 text-sm font-bold transition ${
    active ? 'bg-grove text-cream' : 'bg-cream text-grove/65 hover:bg-leaf-50'
  }`;
}
