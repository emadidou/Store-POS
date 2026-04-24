import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './admin/auth/AuthContext';

const AdminApp = lazy(() => import('./admin/AdminApp'));
const ClientSite = lazy(() => import('./ClientSite'));
const ClientVoucherRoute = lazy(() => import('./ClientVoucherRoute'));

function AppFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-cream px-6 text-grove">
      <p className="text-sm font-semibold text-grove/70">Chargement...</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<AppFallback />}>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/order-success/:orderNumber" element={<ClientVoucherRoute />} />
          <Route path="/*" element={<ClientSite />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
