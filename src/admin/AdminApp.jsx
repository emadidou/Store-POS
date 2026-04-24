import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoadingState } from './components/LoadingState';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AdminLayout } from './layout/AdminLayout';

const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const PosPage = lazy(() => import('./pages/PosPage').then((module) => ({ default: module.PosPage })));
const OrdersPage = lazy(() => import('./pages/OrdersPage').then((module) => ({ default: module.OrdersPage })));
const OrderFormPage = lazy(() => import('./pages/OrderFormPage').then((module) => ({ default: module.OrderFormPage })));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage').then((module) => ({ default: module.OrderDetailPage })));
const OrderInvoicePage = lazy(() => import('./pages/OrderInvoicePage').then((module) => ({ default: module.OrderInvoicePage })));
const OrderReceiptPage = lazy(() => import('./pages/OrderReceiptPage').then((module) => ({ default: module.OrderReceiptPage })));
const OrderPrintPage = lazy(() => import('./pages/OrderPrintPage').then((module) => ({ default: module.OrderPrintPage })));
const ProductsPage = lazy(() => import('./pages/ProductsPage').then((module) => ({ default: module.ProductsPage })));
const ProductFormPage = lazy(() => import('./pages/ProductFormPage').then((module) => ({ default: module.ProductFormPage })));
const StockPage = lazy(() => import('./pages/StockPage').then((module) => ({ default: module.StockPage })));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage').then((module) => ({ default: module.CategoriesPage })));
const CategoryFormPage = lazy(() => import('./pages/CategoryFormPage').then((module) => ({ default: module.CategoryFormPage })));
const CustomersPage = lazy(() => import('./pages/CustomersPage').then((module) => ({ default: module.CustomersPage })));
const CustomerFormPage = lazy(() => import('./pages/CustomerFormPage').then((module) => ({ default: module.CustomerFormPage })));
const CustomerDetailPage = lazy(() => import('./pages/CustomerDetailPage').then((module) => ({ default: module.CustomerDetailPage })));
const SuppliersPage = lazy(() => import('./pages/SuppliersPage').then((module) => ({ default: module.SuppliersPage })));
const SupplierFormPage = lazy(() => import('./pages/SupplierFormPage').then((module) => ({ default: module.SupplierFormPage })));
const PurchasesPage = lazy(() => import('./pages/PurchasesPage').then((module) => ({ default: module.PurchasesPage })));
const PurchaseFormPage = lazy(() => import('./pages/PurchaseFormPage').then((module) => ({ default: module.PurchaseFormPage })));
const PurchaseDetailPage = lazy(() => import('./pages/PurchaseDetailPage').then((module) => ({ default: module.PurchaseDetailPage })));
const PurchaseJournalPage = lazy(() => import('./pages/PurchaseJournalPage').then((module) => ({ default: module.PurchaseJournalPage })));
const PickupSlotsPage = lazy(() => import('./pages/PickupSlotsPage').then((module) => ({ default: module.PickupSlotsPage })));
const BusinessHoursPage = lazy(() => import('./pages/BusinessHoursPage').then((module) => ({ default: module.BusinessHoursPage })));
const StoreSettingsPage = lazy(() => import('./pages/StoreSettingsPage').then((module) => ({ default: module.StoreSettingsPage })));
const SalesJournalPage = lazy(() => import('./pages/SalesJournalPage').then((module) => ({ default: module.SalesJournalPage })));
const AccountingExportPage = lazy(() => import('./pages/AccountingExportPage').then((module) => ({ default: module.AccountingExportPage })));
const TaxSettingsPage = lazy(() => import('./pages/TaxSettingsPage').then((module) => ({ default: module.TaxSettingsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })));

function AdminRouteFallback() {
  return <LoadingState label="Chargement de la page admin..." />;
}

function page(Component) {
  return (
    <Suspense fallback={<AdminRouteFallback />}>
      <Component />
    </Suspense>
  );
}

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={page(LoginPage)} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={page(DashboardPage)} />
          <Route path="pos" element={page(PosPage)} />
          <Route path="orders" element={page(OrdersPage)} />
          <Route path="orders/new" element={page(OrderFormPage)} />
          <Route path="orders/:id" element={page(OrderDetailPage)} />
          <Route path="orders/:id/edit" element={page(OrderFormPage)} />
          <Route path="orders/:id/invoice" element={page(OrderInvoicePage)} />
          <Route path="orders/:id/receipt" element={page(OrderReceiptPage)} />
          <Route path="orders/:id/print" element={page(OrderPrintPage)} />
          <Route path="products" element={page(ProductsPage)} />
          <Route path="products/new" element={page(ProductFormPage)} />
          <Route path="products/:id/edit" element={page(ProductFormPage)} />
          <Route path="stock" element={page(StockPage)} />
          <Route path="stock/movements" element={<Navigate to="/admin/stock?tab=movements" replace />} />
          <Route path="categories" element={page(CategoriesPage)} />
          <Route path="categories/new" element={page(CategoryFormPage)} />
          <Route path="categories/:id/edit" element={page(CategoryFormPage)} />
          <Route path="customers" element={page(CustomersPage)} />
          <Route path="customers/new" element={page(CustomerFormPage)} />
          <Route path="customers/:id" element={page(CustomerDetailPage)} />
          <Route path="customers/:id/edit" element={page(CustomerFormPage)} />
          <Route path="suppliers" element={page(SuppliersPage)} />
          <Route path="suppliers/new" element={page(SupplierFormPage)} />
          <Route path="suppliers/:id/edit" element={page(SupplierFormPage)} />
          <Route path="purchases" element={page(PurchasesPage)} />
          <Route path="purchases/new" element={page(PurchaseFormPage)} />
          <Route path="purchases/:id" element={page(PurchaseDetailPage)} />
          <Route path="purchases/:id/edit" element={page(PurchaseFormPage)} />
          <Route path="purchases/journal" element={page(PurchaseJournalPage)} />
          <Route path="pickup-slots" element={page(PickupSlotsPage)} />
          <Route path="business-hours" element={page(BusinessHoursPage)} />
          <Route path="store-settings" element={page(StoreSettingsPage)} />
          <Route path="sales-journal" element={page(SalesJournalPage)} />
          <Route path="accounting-export" element={page(AccountingExportPage)} />
          <Route path="settings/tax" element={page(TaxSettingsPage)} />
          <Route path="profile" element={page(ProfilePage)} />
        </Route>
      </Route>
    </Routes>
  );
}
