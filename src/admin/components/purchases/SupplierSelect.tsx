import type { Supplier } from '../../api/types';
import { adminInputClass } from '../FormField';

export function SupplierSelect({
  suppliers,
  value,
  onChange,
}: {
  suppliers: Supplier[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <select className={adminInputClass} value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">Sans fournisseur</option>
      {suppliers.map((supplier) => (
        <option key={supplier.id} value={String(supplier.id)}>
          {supplier.name}
        </option>
      ))}
    </select>
  );
}
