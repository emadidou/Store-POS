import type { PurchaseJournalRow } from '../../api/types';
import { DataTable } from '../DataTable';
import { money, shortDate } from '../../utils/format';

export function PurchaseJournal({ rows }: { rows: PurchaseJournalRow[] }) {
  return (
    <DataTable
      columns={['Date', 'Fournisseur', 'Facture externe', 'Numero achat', 'HT', 'TVA', 'TTC', 'Paiement', 'PJ']}
      rows={rows.map((row) => (
        <tr key={`${row.purchase_number}-${row.external_invoice_number ?? 'none'}`} className="hover:bg-leaf-50/45">
          <td className="px-5 py-4 font-semibold">{shortDate(row.date_purchase)}</td>
          <td className="px-5 py-4">{row.supplier_name ?? 'Sans fournisseur'}</td>
          <td className="px-5 py-4">{row.external_invoice_number ?? '-'}</td>
          <td className="px-5 py-4">{row.purchase_number}</td>
          <td className="px-5 py-4">{money(row.amount_ht)}</td>
          <td className="px-5 py-4">{money(row.amount_vat)}</td>
          <td className="px-5 py-4 font-bold">{money(row.amount_ttc)}</td>
          <td className="px-5 py-4">{row.payment_status}</td>
          <td className="px-5 py-4">{row.has_attachment ? 'Oui' : 'Non'}</td>
        </tr>
      ))}
    />
  );
}
