const stockStatusClasses: Record<string, string> = {
  in_stock: 'bg-leaf-50 text-leaf-700',
  low_stock: 'bg-amber-100 text-amber-700',
  out_of_stock: 'bg-tomato/10 text-tomato',
};

const stockStatusLabels: Record<string, string> = {
  in_stock: 'En stock',
  low_stock: 'Stock faible',
  out_of_stock: 'Rupture',
};

export function StockStatusBadge({ status }: { status?: string | null }) {
  const normalizedStatus = status ?? 'in_stock';

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${stockStatusClasses[normalizedStatus] ?? stockStatusClasses.in_stock}`}>
      {stockStatusLabels[normalizedStatus] ?? 'En stock'}
    </span>
  );
}
