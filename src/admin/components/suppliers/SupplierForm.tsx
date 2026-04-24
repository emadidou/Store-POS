import type { Supplier } from '../../api/types';
import { adminInputClass, FormField } from '../FormField';

export type SupplierFormState = {
  name: string;
  phone: string;
  email: string;
  address: string;
  siren: string;
  siret: string;
  vat_number: string;
  notes: string;
  is_active: boolean;
};

export const emptySupplierForm: SupplierFormState = {
  name: '',
  phone: '',
  email: '',
  address: '',
  siren: '',
  siret: '',
  vat_number: '',
  notes: '',
  is_active: true,
};

export function supplierToForm(supplier: Supplier): SupplierFormState {
  return {
    name: supplier.name,
    phone: supplier.phone ?? '',
    email: supplier.email ?? '',
    address: supplier.address ?? '',
    siren: supplier.siren ?? '',
    siret: supplier.siret ?? '',
    vat_number: supplier.vat_number ?? '',
    notes: supplier.notes ?? '',
    is_active: supplier.is_active,
  };
}

export function SupplierForm({
  form,
  onChange,
}: {
  form: SupplierFormState;
  onChange: (key: keyof SupplierFormState, value: string | boolean) => void;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <FormField label="Nom fournisseur">
        <input className={adminInputClass} value={form.name} onChange={(event) => onChange('name', event.target.value)} />
      </FormField>
      <FormField label="Telephone">
        <input className={adminInputClass} value={form.phone} onChange={(event) => onChange('phone', event.target.value)} />
      </FormField>
      <FormField label="Email">
        <input className={adminInputClass} type="email" value={form.email} onChange={(event) => onChange('email', event.target.value)} />
      </FormField>
      <FormField label="TVA intracommunautaire">
        <input className={adminInputClass} value={form.vat_number} onChange={(event) => onChange('vat_number', event.target.value)} />
      </FormField>
      <FormField label="SIREN">
        <input className={adminInputClass} value={form.siren} onChange={(event) => onChange('siren', event.target.value)} />
      </FormField>
      <FormField label="SIRET">
        <input className={adminInputClass} value={form.siret} onChange={(event) => onChange('siret', event.target.value)} />
      </FormField>
      <div className="md:col-span-2">
        <FormField label="Adresse">
          <textarea className={`${adminInputClass} min-h-[90px] resize-none`} value={form.address} onChange={(event) => onChange('address', event.target.value)} />
        </FormField>
      </div>
      <div className="md:col-span-2">
        <FormField label="Notes">
          <textarea className={`${adminInputClass} min-h-[110px] resize-none`} value={form.notes} onChange={(event) => onChange('notes', event.target.value)} />
        </FormField>
      </div>
      <FormField label="Statut">
        <select className={adminInputClass} value={form.is_active ? '1' : '0'} onChange={(event) => onChange('is_active', event.target.value === '1')}>
          <option value="1">Actif</option>
          <option value="0">Inactif</option>
        </select>
      </FormField>
    </div>
  );
}
