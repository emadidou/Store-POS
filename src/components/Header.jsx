import { Menu, ShoppingBag, ShoppingCart, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { navItems } from '../data/siteData.js';

export function Header({ onCartOpen, onNavigate, isProductsPage = false, cartCount = 0, storeName = 'Maison Verde' }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleHomeLink = (event, href) => {
    if (href === '/produits') {
      handleProductsPage(event);
      return;
    }

    if (!isProductsPage) {
      setIsOpen(false);
      return;
    }
    event.preventDefault();
    onNavigate('/');
    window.setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
    setIsOpen(false);
  };

  const handleProductsPage = (event) => {
    event.preventDefault();
    onNavigate('/produits');
    setIsOpen(false);
  };

  const handleCartOpen = () => {
    setIsOpen(false);
    onCartOpen();
  };

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-cream/90 shadow-[0_12px_34px_rgba(31,77,54,0.08)] backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <a
          href="/"
          className="flex items-center gap-3"
          aria-label={`${storeName} accueil`}
          onClick={(event) => {
            event.preventDefault();
            onNavigate('/');
            setIsOpen(false);
          }}
        >
          <span className="grid h-11 w-11 place-items-center rounded-full bg-grove text-cream shadow-soft">
            <ShoppingBag size={20} strokeWidth={1.8} />
          </span>
          <span>
            <span className="block font-display text-lg font-semibold leading-5 text-grove">{storeName}</span>
            <span className="block text-xs font-medium uppercase tracking-[0.18em] text-grove/60">Primeur local</span>
          </span>
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="nav-link" onClick={(event) => handleHomeLink(event, item.href)}>
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <a href="/produits" className="btn btn-primary" onClick={handleProductsPage}>
            Passer une commande
          </a>
          <button
            type="button"
            className="relative grid h-12 w-12 place-items-center rounded-full border border-grove/15 bg-white/80 text-grove transition hover:bg-white hover:shadow-soft"
            onClick={handleCartOpen}
            aria-label={`Ouvrir la commande, ${cartCount} produit${cartCount > 1 ? 's' : ''}`}
          >
            <ShoppingCart size={20} strokeWidth={1.8} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-citrus px-1 text-xs font-bold text-grove">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            className="relative grid h-11 w-11 place-items-center rounded-full border border-grove/15 bg-white/80 text-grove"
            onClick={handleCartOpen}
            aria-label={`Ouvrir la commande, ${cartCount} produit${cartCount > 1 ? 's' : ''}`}
          >
            <ShoppingCart size={19} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-citrus px-1 text-[11px] font-bold text-grove">
                {cartCount}
              </span>
            )}
          </button>
          <button
            className="grid h-11 w-11 place-items-center rounded-full border border-grove/15 bg-white/80 text-grove"
            type="button"
            aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </nav>

      <div
        className={`grid overflow-hidden bg-cream/95 px-5 shadow-soft backdrop-blur-xl transition-all duration-300 lg:hidden ${
          isOpen ? 'max-h-96 pb-5' : 'max-h-0'
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-xl px-3 py-3 text-sm font-medium text-grove/75 transition hover:bg-white hover:text-grove"
              onClick={(event) => handleHomeLink(event, item.href)}
            >
              {item.label}
            </a>
          ))}
          <a href="/produits" className="btn btn-primary mt-2 justify-center" onClick={handleProductsPage}>
            Passer une commande
          </a>
        </div>
      </div>
    </header>
  );
}
