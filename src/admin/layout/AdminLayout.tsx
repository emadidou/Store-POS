import {
  Boxes,
  BarChart3,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  FileSpreadsheet,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBasket,
  ReceiptText,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { adminApi } from '../api/client';
import { useAuth } from '../auth/AuthContext';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', Icon: LayoutDashboard },
  { label: 'Caisse POS', href: '/admin/pos', Icon: CreditCard },
  { label: 'Commandes', href: '/admin/orders', Icon: ShoppingBasket },
  { label: 'Stock', href: '/admin/stock', Icon: Boxes },
  { label: 'Produits', href: '/admin/products', Icon: Package },
  { label: 'Categories', href: '/admin/categories', Icon: FolderTree },
  { label: 'Clients', href: '/admin/customers', Icon: UsersRound },
  { label: 'Fournisseurs', href: '/admin/suppliers', Icon: UsersRound },
  { label: 'Achats', href: '/admin/purchases', Icon: ReceiptText },
  { label: 'Creneaux', href: '/admin/pickup-slots', Icon: CalendarClock },
  { label: 'Horaires', href: '/admin/business-hours', Icon: Clock3 },
  { label: 'Journal ventes', href: '/admin/sales-journal', Icon: ReceiptText },
  { label: 'Export comptable', href: '/admin/accounting-export', Icon: FileSpreadsheet },
  { label: 'Parametres', href: '/admin/store-settings', Icon: Settings },
  { label: 'Profil', href: '/admin/profile', Icon: UserRound },
];

export function AdminLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPosFullscreen, setIsPosFullscreen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [storeName, setStoreName] = useState('Maison Verde');
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    adminApi.storeSettings().then((settings) => setStoreName(settings.store_name)).catch(() => undefined);

    const onStoreSettingsUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ store_name?: string }>).detail;
      if (detail?.store_name) setStoreName(detail.store_name);
    };

    window.addEventListener('store-settings-updated', onStoreSettingsUpdated);

    return () => window.removeEventListener('store-settings-updated', onStoreSettingsUpdated);
  }, []);

  useEffect(() => {
    const updateFullscreenState = () => {
      const nextIsPosFullscreen = location.pathname.startsWith('/admin/pos') && Boolean(document.fullscreenElement);
      setIsPosFullscreen(nextIsPosFullscreen);

      if (!nextIsPosFullscreen) {
        setIsSidebarCollapsed(false);
      }
    };

    updateFullscreenState();
    document.addEventListener('fullscreenchange', updateFullscreenState);

    return () => document.removeEventListener('fullscreenchange', updateFullscreenState);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin-print-layout min-h-screen bg-[#F7F3E9] text-grove">
      <aside
        className={`admin-print-hide fixed inset-y-0 left-0 z-[100001] flex w-72 flex-col border-r border-grove/10 bg-[#123D2D] text-cream shadow-[24px_0_80px_rgba(31,77,54,0.18)] transition-transform duration-300 ${
          isPosFullscreen && isSidebarCollapsed ? '-translate-x-full' : isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-20 items-center justify-between px-5">
          <div>
            <p className="font-display text-xl font-semibold">{storeName}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cream/55">Admin panel</p>
          </div>
          <div className="flex gap-2">
            {isPosFullscreen && (
              <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20" onClick={() => setIsSidebarCollapsed(true)} aria-label="Reduire le menu admin">
                <ChevronLeft size={18} />
              </button>
            )}
            <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 lg:hidden" onClick={() => setIsOpen(false)} aria-label="Fermer le menu admin">
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="admin-sidebar-scroll flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map(({ href, Icon, label }) => (
            <NavLink
              key={href}
              to={href}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive ? 'bg-cream text-grove shadow-soft' : 'text-cream/72 hover:bg-white/10 hover:text-cream'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button type="button" className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-cream/75 transition hover:bg-white/10 hover:text-cream" onClick={handleLogout}>
            <LogOut size={18} />
            Deconnexion
          </button>
        </div>
      </aside>

      {isPosFullscreen && isSidebarCollapsed && (
        <button
          type="button"
          className="admin-print-hide fixed left-4 top-1/2 z-[100002] flex -translate-y-1/2 flex-col items-center gap-2 rounded-full bg-grove px-3 py-5 text-xs font-black uppercase tracking-[0.12em] text-cream shadow-[0_24px_70px_rgba(18,61,45,0.28)] transition hover:-translate-y-[52%] hover:bg-leaf-700"
          onClick={() => setIsSidebarCollapsed(false)}
          aria-label="Ouvrir le menu admin"
        >
          <ChevronRight size={20} />
          <span className="[writing-mode:vertical-rl]">Menu</span>
        </button>
      )}

      {isOpen && <button type="button" className="admin-print-hide fixed inset-0 z-[100000] bg-grove/30 backdrop-blur-sm lg:hidden" aria-label="Fermer le menu admin" onClick={() => setIsOpen(false)} />}

      <div className={`admin-print-content transition-[padding] duration-300 ${isPosFullscreen && isSidebarCollapsed ? 'lg:pl-0' : 'lg:pl-72'}`}>
        <header className="admin-print-hide sticky top-0 z-[90] flex h-20 items-center justify-between border-b border-grove/10 bg-[#F7F3E9]/90 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-grove/10 bg-white text-grove lg:hidden" onClick={() => setIsOpen(true)} aria-label="Ouvrir le menu admin">
              <Menu size={20} />
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-grove/45">Back office</p>
              <p className="font-display text-lg font-semibold text-grove">{currentSection(location.pathname)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-grove/10 bg-white px-3 py-2 shadow-[0_1px_0_rgba(31,77,54,0.08)]">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-leaf-50 text-leaf-700">
              <BarChart3 size={17} />
            </span>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-4 text-grove">{user?.name ?? 'Admin'}</p>
              <p className="text-xs font-medium text-grove/50">{user?.email ?? 'admin@maison-verde.test'}</p>
            </div>
          </div>
        </header>

        <main className="admin-print-main px-5 py-8 sm:px-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function currentSection(pathname: string) {
  const match = navItems.find((item) => pathname.startsWith(item.href));
  return match?.label ?? 'Dashboard';
}
