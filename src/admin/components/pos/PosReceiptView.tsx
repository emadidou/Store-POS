import type { Order, StoreSettings } from '../../api/types';
import { ThermalReceipt } from '../receipt/ThermalReceipt';

export function PosReceiptView({ order, store }: { order: Order | null; store?: Partial<StoreSettings> | null }) {
  return <ThermalReceipt order={order} store={store} />;
}
