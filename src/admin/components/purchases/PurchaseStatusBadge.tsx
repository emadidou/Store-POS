export function PurchaseStatusBadge({ status }: { status: string }) {
  const style = status === 'confirmed'
    ? 'bg-leaf-100 text-leaf-700'
    : status === 'cancelled'
      ? 'bg-tomato/10 text-tomato'
      : 'bg-grove/10 text-grove';

  const label = status === 'confirmed'
    ? 'Confirme'
    : status === 'cancelled'
      ? 'Annule'
      : 'Brouillon';

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${style}`}>{label}</span>;
}
