import { CheckCircle2, Download, Eye, FileText, Printer, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminApi } from '../api/client';
import type { Purchase } from '../api/types';
import { ConfirmModal } from '../components/ConfirmModal';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { PurchasePaymentBadge } from '../components/purchases/PurchasePaymentBadge';
import { PurchaseStatusBadge } from '../components/purchases/PurchaseStatusBadge';
import { money, shortDate } from '../utils/format';

export function PurchaseDetailPage() {
  const { id = '' } = useParams();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [error, setError] = useState('');
  const [action, setAction] = useState<'confirmed' | 'cancelled' | null>(null);

  useEffect(() => {
    adminApi.purchase(id)
      .then(setPurchase)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Impossible de charger l'achat."));
  }, [id]);

  const updateStatus = async () => {
    if (!purchase || !action) return;

    try {
      const updated = await adminApi.updatePurchaseStatus(purchase.id, action);
      setPurchase(updated);
      setError('');
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Action impossible.');
    } finally {
      setAction(null);
    }
  };

  if (error && !purchase) return <ErrorState title="Achat indisponible" description={error} />;
  if (!purchase) return <LoadingState label="Chargement de l'achat..." />;

  return (
    <>
      <PageHeader
        title={`Achat ${purchase.purchase_number}`}
        description="Retrouvez la facture fournisseur, les lignes d'achat et les mouvements de stock lies."
        action={(
          <div className="flex flex-wrap gap-2">
            <Link className="btn btn-secondary" to="/admin/purchases">Retour</Link>
            {purchase.status === 'draft' && <Link className="btn btn-secondary" to={`/admin/purchases/${purchase.id}/edit`}>Modifier</Link>}
            {purchase.has_attachment && (
              <>
                <button type="button" className="btn btn-secondary" onClick={() => adminApi.openAdminFile(`/admin/purchases/${purchase.id}/attachment`)}>
                  <Eye size={17} />
                  Voir facture
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => adminApi.downloadAdminFile(`/admin/purchases/${purchase.id}/attachment/download`, `${purchase.purchase_number}-facture-fournisseur`)}>
                  <Download size={17} />
                  Telecharger facture
                </button>
              </>
            )}
            <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
              <Printer size={17} />
              Imprimer recap
            </button>
          </div>
        )}
      />
      {error && <p className="mb-4 rounded-2xl bg-tomato/10 p-3 text-sm font-semibold text-tomato">{error}</p>}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-[1.5rem] border border-grove/10 bg-white p-5 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              <PurchaseStatusBadge status={purchase.status} />
              <PurchasePaymentBadge status={purchase.payment_status} />
            </div>
            <p className="font-display text-3xl font-semibold">{money(purchase.total_ttc)}</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Info label="Fournisseur" value={purchase.supplier?.name ?? 'Sans fournisseur'} />
            <Info label="Date achat" value={shortDate(purchase.purchase_date)} />
            <Info label="Facture fournisseur" value={purchase.external_invoice_number ?? '-'} />
            <Info label="Date facture" value={shortDate(purchase.external_invoice_date)} />
            <Info label="Paiement" value={purchase.payment_method ?? '-'} />
            <Info label="Piece jointe" value={purchase.has_attachment ? 'Oui' : 'Non'} />
            <Info label="Total HT" value={money(purchase.subtotal_ht)} />
            <Info label="TVA" value={money(purchase.total_vat)} />
          </div>

          <h2 className="mt-8 font-display text-2xl font-semibold">Lignes d'achat</h2>
          <div className="mt-4 grid gap-3">
            {(purchase.items ?? []).map((item) => (
              <article key={item.id} className="grid gap-2 rounded-2xl bg-cream p-4 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-semibold">{item.product_name_snapshot}</p>
                  <p className="text-sm text-grove/60">{item.quantity} x {money(item.unit_cost_ht)} HT · TVA {item.vat_rate}%</p>
                </div>
                <p className="font-display font-semibold">{money(item.subtotal_ttc)}</p>
              </article>
            ))}
          </div>

          <h2 className="mt-8 font-display text-2xl font-semibold">Mouvements de stock lies</h2>
          <div className="mt-4 grid gap-3">
            {(purchase.stock_movements ?? []).length > 0 ? (purchase.stock_movements ?? []).map((movement) => (
              <article key={movement.id} className="rounded-2xl bg-cream p-4">
                <p className="font-semibold">{movement.product?.name ?? `Produit #${movement.product_id}`}</p>
                <p className="text-sm text-grove/60">{movement.type} · {movement.quantity} · ref {movement.reference ?? '-'}</p>
                <p className="text-sm text-grove/50">{movement.reason} {movement.note ? `· ${movement.note}` : ''}</p>
              </article>
            )) : <p className="text-sm text-grove/60">Aucun mouvement de stock pour le moment.</p>}
          </div>
        </section>

        <aside className="rounded-[1.5rem] border border-grove/10 bg-white p-5 shadow-soft">
          <h2 className="font-display text-2xl font-semibold">Actions</h2>
          <div className="mt-5 grid gap-3">
            {purchase.status === 'draft' && (
              <button type="button" className="btn btn-secondary justify-center" onClick={() => setAction('confirmed')}>
                <CheckCircle2 size={17} />
                Confirmer achat
              </button>
            )}
            {purchase.status !== 'cancelled' && (
              <button type="button" className="btn btn-secondary justify-center text-tomato" onClick={() => setAction('cancelled')}>
                <XCircle size={17} />
                Annuler achat
              </button>
            )}
            {purchase.has_attachment && (
              <button type="button" className="btn btn-secondary justify-center" onClick={() => adminApi.downloadAdminFile(`/admin/purchases/${purchase.id}/attachment/download`, `${purchase.purchase_number}-facture-fournisseur`)}>
                <FileText size={17} />
                Telecharger la facture
              </button>
            )}
          </div>
        </aside>
      </div>
      <ConfirmModal
        isOpen={Boolean(action)}
        title={action === 'confirmed' ? 'Confirmer cet achat ?' : 'Annuler cet achat ?'}
        description={action === 'confirmed' ? "Le stock sera augmente maintenant." : "L'annulation essayera de restaurer un mouvement inverse sans casser le stock."}
        onCancel={() => setAction(null)}
        onConfirm={updateStatus}
      />
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-cream p-4">
      <p className="text-xs font-bold uppercase tracking-[0.13em] text-grove/45">{label}</p>
      <p className="mt-1 font-semibold text-grove">{value}</p>
    </div>
  );
}
