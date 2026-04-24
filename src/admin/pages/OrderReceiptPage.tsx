import { ArrowLeft, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminApi } from '../api/client';
import type { Order, StoreSettings } from '../api/types';
import { ErrorState } from '../components/ErrorState';
import { ThermalReceipt } from '../components/receipt/ThermalReceipt';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { printerService } from '../services/printerService';

export function OrderReceiptPage() {
  const { id = '' } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([adminApi.order(id), adminApi.storeSettings()])
      .then(([orderData, settingsData]) => {
        setOrder(orderData);
        setSettings(settingsData);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Impossible de charger le ticket.');
      });
  }, [id]);

  useEffect(() => {
    document.body.classList.remove('print-a4');
  }, []);

  if (error) return <ErrorState title="Ticket indisponible" description={error} />;
  if (!order) return <LoadingState label="Preparation du ticket..." />;

  return (
    <>
      <div className="thermal-print-hide">
        <PageHeader
          title={`Ticket ${order.order_number}`}
          description="Vue ticket optimisee pour papier thermique 80 mm."
          action={(
            <div className="flex flex-wrap gap-2">
              <Link className="btn btn-secondary" to={`/admin/orders/${order.id}`}>
                <ArrowLeft size={17} />
                Retour
              </Link>
              <button className="btn btn-primary" type="button" onClick={() => printerService.printReceipt()}>
                <Printer size={17} />
                Imprimer ticket
              </button>
            </div>
          )}
        />
      </div>

      <div className="thermal-receipt-shell mx-auto max-w-sm rounded-[1.5rem] border border-grove/10 bg-white p-4 shadow-soft">
        <ThermalReceipt order={order} store={settings} />
      </div>
    </>
  );
}
