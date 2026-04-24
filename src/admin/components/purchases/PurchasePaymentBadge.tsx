export function PurchasePaymentBadge({ status }: { status: string }) {
  const style = status === 'paid'
    ? 'bg-leaf-100 text-leaf-700'
    : status === 'partial'
      ? 'bg-sun/20 text-grove'
      : 'bg-grove/10 text-grove/70';

  const label = status === 'paid'
    ? 'Paye'
    : status === 'partial'
      ? 'Partiel'
      : 'Impayee';

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${style}`}>{label}</span>;
}
