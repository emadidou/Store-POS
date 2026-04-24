import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getStoreSettings } from './api/storeSettings';
import { About } from './components/About.jsx';
import { AvantagesRetrait } from './components/AvantagesRetrait.jsx';
import { CartDrawer } from './components/CartDrawer.jsx';
import { Categories } from './components/Categories.jsx';
import { CheckoutPage } from './components/CheckoutPage.jsx';
import { CommandeExpress } from './components/CommandeExpress.jsx';
import { Contact } from './components/Contact.jsx';
import { CursorGlow } from './components/CursorGlow';
import { FeaturedProducts } from './components/FeaturedProducts.jsx';
import { FloatingActions } from './components/FloatingActions';
import { FloatingBackground } from './components/FloatingBackground';
import { Footer } from './components/Footer.jsx';
import { Header } from './components/Header.jsx';
import { Hero } from './components/Hero.jsx';
import { HowItWorks } from './components/HowItWorks.jsx';
import { LiveIndicator } from './components/LiveIndicator';
import { ProductsPage } from './components/ProductsPage.jsx';
import { ScrollProgress } from './components/ScrollProgress';
import { Testimonials } from './components/Testimonials.jsx';

const DEFAULT_WEIGHT_GRAMS = 500;
const WEIGHT_STEP_GRAMS = 250;

export default function ClientSite() {
  const location = useLocation();
  const routerNavigate = useNavigate();
  const path = location.pathname;
  const [storeSettings, setStoreSettings] = useState({
    store_name: 'Maison Verde',
    phone: '+212600000000',
    email: 'contact@maison-verde.test',
    address: 'Adresse du magasin',
    currency: 'EUR',
  });
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem('maison-verde-cart')) ?? [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [path]);

  useEffect(() => {
    getStoreSettings().then((settings) => {
      setStoreSettings(settings);
      document.title = `${settings.store_name} - Primeur local`;
    });
  }, []);

  useEffect(() => {
    window.localStorage.setItem('maison-verde-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const navigate = (nextPath) => {
    if (nextPath === path) return;
    routerNavigate(nextPath);
  };

  const addToCart = (product) => {
    setCartItems((items) => {
      const existingItem = items.find((item) => item.name === product.name);
      if (existingItem) {
        return items.map((item) =>
          item.name === product.name
            ? {
                ...item,
                quantityGrams: (item.quantityGrams ?? (item.quantity ?? 1) * 1000) + DEFAULT_WEIGHT_GRAMS,
              }
            : item,
        );
      }

      return [...items, { ...product, quantityGrams: DEFAULT_WEIGHT_GRAMS }];
    });
    setIsCartOpen(true);
  };

  const updateCartWeight = (productName, weightGrams) => {
    if (weightGrams < WEIGHT_STEP_GRAMS) {
      setCartItems((items) => items.filter((item) => item.name !== productName));
      return;
    }

    setCartItems((items) =>
      items.map((item) => (item.name === productName ? { ...item, quantityGrams: weightGrams } : item)),
    );
  };

  const removeFromCart = (productName) => {
    setCartItems((items) => items.filter((item) => item.name !== productName));
  };

  const clearCart = () => setCartItems([]);

  const isProductsPage = path === '/produits';
  const isCheckoutPage = path === '/checkout';
  const cartCount = cartItems.length;

  const goToCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-cream text-grove antialiased">
      <FloatingBackground />
      <CursorGlow />
      <ScrollProgress />
      <Header
        onCartOpen={() => setIsCartOpen(true)}
        onNavigate={navigate}
        isProductsPage={isProductsPage || isCheckoutPage}
        cartCount={cartCount}
        storeName={storeSettings.store_name}
      />
      <main>
        {isCheckoutPage ? (
          <CheckoutPage currency={storeSettings.currency} items={cartItems} storeSettings={storeSettings} onClearCart={clearCart} onNavigate={navigate} />
        ) : isProductsPage ? (
          <ProductsPage currency={storeSettings.currency} onAddToCart={addToCart} />
        ) : (
          <>
            <Hero onNavigate={navigate} />
            <HowItWorks />
            <Categories />
            <FeaturedProducts currency={storeSettings.currency} onAddToCart={addToCart} onNavigate={navigate} />
            <AvantagesRetrait />
            <CommandeExpress onNavigate={navigate} />
            <Testimonials />
            <About storeName={storeSettings.store_name} />
            <Contact storeSettings={storeSettings} />
          </>
        )}
      </main>
      <CartDrawer
        items={cartItems}
        isOpen={isCartOpen}
        onCheckout={goToCheckout}
        onClose={() => setIsCartOpen(false)}
        onWeightChange={updateCartWeight}
        onRemove={removeFromCart}
        onClear={clearCart}
        currency={storeSettings.currency}
      />
      <LiveIndicator />
      <FloatingActions storeName={storeSettings.store_name} phone={storeSettings.phone} />
      <Footer storeName={storeSettings.store_name} phone={storeSettings.phone} email={storeSettings.email} address={storeSettings.address} />
    </div>
  );
}
