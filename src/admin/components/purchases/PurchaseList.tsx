import { CheckCircle2, Edit, Eye, FileText, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Purchase } from '../../api/types';
import { DataTable } from '../DataTable';
import { PurchasePaymentBadge } from './PurchasePaymentBadge';
import { PurchaseStatusBadge } from './PurchaseStatusBadge';
import { money, shortDate } from '../../utils/format';

export function PurchaseList({
  purchases,
  onConfirm,
  onCancel,
  onOpenAttachment,
}: {
  purchases: Purchase[];
  onConfirm: (purchase: Purchase) => void;
  onCancel: (purchase: Purchase) => void;
  onOpenAttachment: (purchase: Purchase) => void;
}) {
  return (
    <DataTable
      columns={['Numero', 'Fournisseur', 'Facture externe', 'Date', 'Total TTC', 'Statut', 'Paiement', 'PJ', 'Actions']}
      rows={purchases.map((purchase) => (
        <tr key={purchase.id} className="hover:bg-leaf-50/45">
          <td className="px-5 py-4 font-semibold">{purchase.purchase_number}</td>
          <td className="px-5 py-4">{purchase.supplier?.name ?? 'Sans fournisseur'}</td>
          <td className="px-5 py-4">{purchase.external_invoice_number ?? '-'}</td>
          <td className="px-5 py-4">{shortDate(purchase.purchase_date)}</td>
          <td className="px-5 py-4 font-bold">{money(purchase.total_ttc)}</td>
          <td className="px-5 py-4"><PurchaseStatusBadge status={purchase.status} /></td>
          <td className="px-5 py-4"><PurchasePaymentBadge status={purchase.payment_status} /></td>
          <td className="px-5 py-4">{purchase.has_attachment ? 'Oui' : 'Non'}</td>
          <td className="px-5 py-4">
            <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
              <Link className="inline-grid h-9 w-9 place-items-center rounded-full bg-grove text-cream" to={`/admin/purchases/${purchase.id}`} title="Voir">
                <Eye size={15} />
              </Link>
              {purchase.status === 'draft' && (
                <Link className="inline-grid h-9 w-9 place-items-center rounded-full bg-leaf-50 text-leaf-700" to={`/admin/purchases/${purchase.id}/edit`} title="Modifier">
                  <Edit size={15} />
                </Link>
              )}
              {purchase.status === 'draft' && (
                <button className="inline-grid h-9 w-9 place-items-center rounded-full bg-leaf-100 text-leaf-700" type="button" onClick={() => onConfirm(purchase)} title="Confirmer">
                  <CheckCircle2 size={15} />
                </button>
              )}
              {purchase.status !== 'cancelled' && (
                <button className="inline-grid h-9 w-9 place-items-center rounded-full bg-tomato/10 text-tomato" type="button" onClick={() => onCancel(purchase)} title="Annuler">
                  <XCircle size={15} />
                </button>
              )}
              {purchase.has_attachment && (
                <button className="inline-grid h-9 w-9 place-items-center rounded-full bg-sand text-grove" type="button" onClick={() => onOpenAttachment(purchase)} title="Voir la facture">
                  <FileText size={15} />
                </button>
              )}
            </div>
          </td>
        </tr>
      ))}
    />
  );
}
