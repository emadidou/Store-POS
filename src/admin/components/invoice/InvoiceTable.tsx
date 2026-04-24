import type { OrderItem } from '../../api/types';
import { money } from '../../utils/format';

export function InvoiceTable({ items }: { items?: OrderItem[] }) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border-2 border-black">
      <table className="w-full border-collapse text-left text-sm text-black">
        <thead className="bg-white text-black">
          <tr>
            <th className="border-b-2 border-black px-4 py-3 font-black uppercase">Produit</th>
            <th className="border-b-2 border-black px-4 py-3 text-center font-black uppercase">Quantite</th>
            <th className="border-b-2 border-black px-4 py-3 text-right font-black uppercase">Prix unitaire</th>
            <th className="border-b-2 border-black px-4 py-3 text-right font-black uppercase">Total ligne</th>
          </tr>
        </thead>
        <tbody>
          {(items ?? []).map((item) => (
            <tr key={item.id} className="border-t border-black/20">
              <td className="px-4 py-3 font-bold">{item.product_name_snapshot}</td>
              <td className="px-4 py-3 text-center font-semibold">{item.quantity}</td>
              <td className="px-4 py-3 text-right">{money(item.unit_price)}</td>
              <td className="px-4 py-3 text-right font-black">{money(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
