import type { OrderStatus } from '../api/types';

const statusLabels: Record<OrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmee',
  preparing: 'Preparation',
  ready: 'Prete',
  picked_up: 'Recuperee',
  cancelled: 'Annulee',
};

const statusStyles: Record<OrderStatus, string> = {
  pending: 'bg-citrus/15 text-[#8A5B00] border-citrus/20',
  confirmed: 'bg-leaf-50 text-leaf-700 border-leaf-200',
  preparing: 'bg-[#EAF3FF] text-[#24527A] border-[#C9E2FF]',
  ready: 'bg-[#E9F9EF] text-[#176B3A] border-[#BFEBCF]',
  picked_up: 'bg-grove/10 text-grove border-grove/15',
  cancelled: 'bg-tomato/10 text-tomato border-tomato/20',
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

export { statusLabels };
