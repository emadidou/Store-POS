import { CheckCircle2, Edit, FileMinus, FileText, PackageCheck, Play, Printer, ShoppingBag, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../api/client';
import type { Order, OrderStatus } from '../api/types';
import { ConfirmModal } from '../components/ConfirmModal';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { CreditNoteModal } from '../components/orders/CreditNoteModal';
import { money, shortDate, time } from '../utils/format';

const actions: Array<{ status: OrderStatus; label: string; Icon: React.ElementType }> = [
  { status: 'confirmed', label: 'Confirmer', Icon: CheckCircle2 },
  { status: 'preparing', label: 'Preparation', Icon: Play },
  { status: 'ready', label: 'Prete', Icon: PackageCheck },
  { status: 'picked_up', label: 'Recuperee', Icon: ShoppingBag },
  { status: 'cancelled', label: 'Annuler', Icon: XCircle },
];

export function OrderDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [creditNotes, setCreditNotes] = useState<Order[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCreditNoteOpen, setIsCreditNoteOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([adminApi.order(id), adminApi.orderCreditNotes(id)])
      .then(([loadedOrder, loadedCreditNotes]) => {
        setOrder(loadedOrder);
        setCreditNotes(loadedCreditNotes);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Impossible de charger la commande.');
      });
  }, [id]);

  const updateStatus = async (status: OrderStatus) => {
    if (!order) return;
    setIsUpdating(true);
    setError('');

    try {
      const updated = await adminApi.updateOrderStatus(order.id, status);
      setOrder(updated);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Impossible de mettre a jour le statut.');
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteOrder = async () => {
    if (!order) return;
    try {
      await adminApi.deleteOrder(order.id);
      navigate('/admin/orders');
    } catch (deleteError) {
      setIsDeleteOpen(false);
      window.alert(deleteError instanceof Error ? deleteError.message : 'Impossible de supprimer cette commande.');
    }
  };

  if (error && !order) return <ErrorState title="Commande indisponible" description={error} />;
  if (!order) return <LoadingState label="Chargement de la commande..." />;
  const hasInvoice = order.document_type === 'invoice' || order.payment_status === 'paid' || Boolean(order.is_paid || order.invoice_number);
  const isCounterSale = (order.source === 'pos' || order.source === 'pos-caisse' || order.source === 'caisse')
    && (order.order_type === 'in_store' || order.customer.phone === 'POS-CAISSE');
  const canCreateCreditNote = hasInvoice && order.status !== 'cancelled' && (order.document_type !== 'credit_note');

  return (
    <>
      {error && order && <p className="mb-4 rounded-2xl bg-tomato/10 p-3 text-sm font-semibold text-tomato">{error}</p>}
      <PageHeader
        title={`Commande ${order.order_number}`}
        description={isCounterSale ? 'Detail de la vente caisse et document facture.' : 'Detail de preparation et suivi du retrait.'}
        action={(
          <div className="flex flex-wrap gap-2">
            <Link className="btn btn-secondary" to="/admin/orders">Retour</Link>
            <Link className="btn btn-primary" to={`/admin/orders/${order.id}/print`}>
              <FileText size={17} />
              {hasInvoice ? 'Imprimer la facture' : 'Imprimer le bon'}
            </Link>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => adminApi.downloadAdminFile(hasInvoice ? `/admin/orders/${order.id}/invoice-pdf` : `/admin/orders/${order.id}/voucher-pdf`, `${hasInvoice ? (order.invoice_number ?? order.order_number) : order.order_number}.pdf`)}
            >
              <FileText size={17} />
              PDF
            </button>
            <Link className="btn btn-secondary" to={`/admin/orders/${order.id}/receipt`}>
              <Printer size={17} />
              Ticket 80mm
            </Link>
            {canCreateCreditNote && (
              <button className="btn btn-secondary" type="button" onClick={() => setIsCreditNoteOpen(true)}>
                <FileMinus size={17} />
                Creer un avoir
              </button>
            )}
            {!hasInvoice && (
              <>
                <Link className="btn btn-secondary" to={`/admin/orders/${order.id}/edit`}>
                  <Edit size={17} />
                  Editer
                </Link>
                <button className="btn btn-secondary text-tomato" type="button" onClick={() => setIsDeleteOpen(true)}>
                  <Trash2 size={17} />
                  Supprimer
                </button>
              </>
            )}
          </div>
        )}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-[1.5rem] border border-grove/10 bg-white p-5 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-grove/45">Statut actuel</p>
              <div className="mt-2"><StatusBadge status={order.status} /></div>
            </div>
            <p className="font-display text-3xl font-semibold">{money(order.total_amount)}</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Info label="Client" value={order.customer.full_name} />
            <Info label="Telephone" value={order.customer.phone} />
            <Info label="Email" value={order.customer.email ?? '-'} />
            {isCounterSale ? (
              <Info label="Source" value="Caisse POS" />
            ) : (
              <Info label="Retrait" value={`${shortDate(order.pickup_date)} a ${time(order.pickup_time)}`} />
            )}
            <Info label="Paiement" value={order.payment_method} />
            <Info label="Document" value={hasInvoice ? `Facture ${order.invoice_number ?? ''}` : 'Bon de commande'} />
            <Info label="Statut paiement" value={order.payment_status ?? (order.is_paid ? 'paid' : 'pending')} />
            <Info label="Avoirs emis" value={creditNotes.length > 0 ? `${creditNotes.length}` : 'Aucun'} />
            <Info label="Notes" value={order.notes ?? 'Aucune note'} />
          </div>

          <h2 className="mt-8 font-display text-2xl font-semibold">Produits commandes</h2>
          <div className="mt-4 grid gap-3">
            {(order.items ?? []).map((item) => (
              <article key={item.id} className="grid gap-2 rounded-2xl bg-cream p-4 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-semibold">{item.product_name_snapshot}</p>
                  <p className="text-sm text-grove/60">{item.quantity} x {money(item.unit_price)}</p>
                </div>
                <p className="font-display font-semibold">{money(item.subtotal)}</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="rounded-[1.5rem] border border-grove/10 bg-white p-5 shadow-soft">
          <h2 className="font-display text-2xl font-semibold">Actions rapides</h2>
          <div className="mt-5 grid gap-3">
            {actions.map(({ status, label, Icon }) => (
              <button key={status} type="button" className="btn btn-secondary justify-center" disabled={isUpdating || order.status === status} onClick={() => updateStatus(status)}>
                <Icon size={17} />
                {label}
              </button>
            ))}
          </div>

          <div className="mt-6 border-t border-grove/10 pt-5">
            <h3 className="font-display text-xl font-semibold text-grove">Avoirs lies</h3>
            {creditNotes.length > 0 ? (
              <div className="mt-4 grid gap-3">
                {creditNotes.map((creditNote) => (
                  <article key={creditNote.id} className="rounded-2xl bg-cream p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-grove">{creditNote.credit_note_number ?? creditNote.order_number}</p>
                        <p className="text-sm text-grove/60">{shortDate(creditNote.refunded_at ?? creditNote.created_at)} · {money(creditNote.total_ttc ?? creditNote.total_amount)}</p>
                        <p className="mt-1 text-sm text-grove/55">{creditNote.refund_reason ?? 'Motif non renseigne'}</p>
                      </div>
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => adminApi.downloadAdminFile(`/admin/credit-notes/${creditNote.id}/pdf`, `${creditNote.credit_note_number ?? creditNote.order_number}.pdf`)}
                      >
                        PDF
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-grove/60">Aucun avoir genere pour cette facture pour le moment.</p>
            )}
          </div>
        </aside>
      </div>
      <ConfirmModal isOpen={isDeleteOpen} title="Supprimer cette commande ?" description="Le stock associe sera restaure automatiquement." onCancel={() => setIsDeleteOpen(false)} onConfirm={deleteOrder} />
      <CreditNoteModal
        order={isCreditNoteOpen ? order : null}
        creditNotes={creditNotes}
        onClose={() => setIsCreditNoteOpen(false)}
        onCreated={async (creditNote) => {
          setCreditNotes((current) => [creditNote, ...current]);
          try {
            const [freshOrder, freshCreditNotes] = await Promise.all([adminApi.order(order.id), adminApi.orderCreditNotes(order.id)]);
            setOrder(freshOrder);
            setCreditNotes(freshCreditNotes);
          } catch {
            // Keep optimistic credit note list if the refresh fails.
          }
        }}
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
