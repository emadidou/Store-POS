import type { PosPaymentMethod } from '../../types/pos';

export function PosPaymentSelector({ onChange, value }: { value: PosPaymentMethod; onChange: (value: PosPaymentMethod) => void }) {
  const options: Array<[PosPaymentMethod, string]> = [
    ['cash', 'Especes'],
    ['stripe', 'Carte / TPE'],
    ['stripe_later_ready', 'A la reception'],
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map(([method, label]) => (
        <button key={method} type="button" className={buttonClass(value === method)} onClick={() => onChange(method)}>
          {label}
        </button>
      ))}
    </div>
  );
}

function buttonClass(active: boolean) {
  return `rounded-2xl px-3 py-3 text-sm font-bold transition ${
    active ? 'bg-leaf-700 text-white shadow-soft' : 'bg-cream text-grove/65 hover:bg-leaf-50'
  }`;
}
