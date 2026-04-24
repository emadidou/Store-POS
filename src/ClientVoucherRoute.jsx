import { useNavigate } from 'react-router-dom';
import { OrderVoucherPage } from './components/OrderVoucherPage.jsx';

export default function ClientVoucherRoute() {
  const routerNavigate = useNavigate();

  return <OrderVoucherPage onNavigate={(nextPath) => routerNavigate(nextPath)} />;
}
