import { ArrowLeft, Download, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminApi } from '../api/client';
import type { Order, StoreSettings } from '../api/types';
import { ErrorState } from '../components/ErrorState';
import { InvoiceView } from '../components/invoice/InvoiceView';
import { OrderVoucherView } from '../components/invoice/OrderVoucherView';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';

export function OrderPrintPage() {
  const { id = '' } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.classList.add('print-a4');
    return () => document.body.classList.remove('print-a4');
  }, []);

  useEffect(() => {
    Promise.all([adminApi.order(id), adminApi.storeSettings()])
      .then(([orderData, settingsData]) => {
        setOrder(orderData);
        setSettings(settingsData);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Impossible de charger le document.');
      });
  }, [id]);

  if (error) return <ErrorState title="Document indisponible" description={error} />;
  if (!order || !settings) return <LoadingState label="Preparation du document..." />;
  const isInvoice = order.document_type === 'invoice' || order.payment_status === 'paid' || Boolean(order.is_paid || order.invoice_number);
  const title = isInvoice ? `Facture ${order.invoice_number ?? order.order_number}` : `Bon de commande ${order.order_number}`;

  return (
    <>
      <div className="invoice-print-hide">
        <PageHeader
          title={title}
          description={isInvoice ? 'Facture payee, prete a imprimer.' : 'Bon de commande non facture, pret pour le retrait magasin.'}
          action={(
            <div className="flex flex-wrap gap-2">
              <Link className="btn btn-secondary" to={`/admin/orders/${order.id}`}>
                <ArrowLeft size={17} />
                Retour
              </Link>
              <button className="btn btn-primary" type="button" onClick={() => window.print()}>
                <Printer size={17} />
                Imprimer
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => window.print()}>
                <Download size={17} />
                Telecharger PDF
              </button>
            </div>
          )}
        />
      </div>

      {isInvoice ? <InvoiceView order={order} settings={settings} /> : <OrderVoucherView order={order} settings={settings} />}
    </>
  );
}
