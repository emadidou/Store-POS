import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useProducts } from '../hooks/useCatalog';

const ITEMS_PER_PAGE = 10;

const normalize = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export function ProductsPage({ currency, onAddToCart }) {
  const { data: products, error, isLoading } = useProducts(currency);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tous');
  const [badge, setBadge] = useState('Tous');
  const [page, setPage] = useState(1);

  const categories = useMemo(() => ['Tous', ...new Set(products.map((product) => product.category))], [products]);
  const badges = useMemo(() => ['Tous', ...new Set(products.map((product) => product.badge))], [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalize(query.trim());

    return products.filter((product) => {
      const matchesSearch =
        !normalizedQuery ||
        normalize(`${product.name} ${product.category} ${product.badge}`).includes(normalizedQuery);
      const matchesCategory = category === 'Tous' || product.category === category;
      const matchesBadge = badge === 'Tous' || product.badge === badge;

      return matchesSearch && matchesCategory && matchesBadge;
    });
  }, [badge, category, products, query]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const currentProducts = filteredProducts.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const updateFilter = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('Tous');
    setBadge('Tous');
    setPage(1);
  };

  return (
    <section className="min-h-screen bg-cream pb-20 pt-28 sm:pt-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end"
        >
          <div>
            <p className="eyebrow">Catalogue</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-normal text-grove sm:text-5xl">
              Tous les produits frais
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-grove/70">
              Recherchez, filtrez, ajoutez a votre commande puis recuperez vos produits deja prepares en magasin.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-grove/10 bg-white p-4 shadow-soft">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-grove/45" size={20} />
              <input
                type="search"
                value={query}
                onChange={(event) => updateFilter(setQuery, event.target.value)}
                placeholder="Rechercher un produit"
                className="h-14 w-full rounded-full border border-grove/10 bg-cream pl-12 pr-4 text-base text-grove outline-none transition placeholder:text-grove/42 focus:border-leaf-500 focus:bg-white focus:ring-4 focus:ring-leaf-100"
              />
            </label>
          </div>
        </motion.div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-[1.5rem] border border-grove/10 bg-white p-5 shadow-[0_1px_0_rgba(31,77,54,0.08)] lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-grove">
                <SlidersHorizontal size={19} />
                Filtres
              </h2>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-full bg-cream text-grove transition hover:bg-linen"
                onClick={clearFilters}
                aria-label="Reinitialiser les filtres"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid gap-5">
              <label className="form-field">
                Categorie
                <select
                  value={category}
                  onChange={(event) => updateFilter(setCategory, event.target.value)}
                  className="h-12 rounded-2xl border border-grove/10 bg-cream px-4 text-base font-normal text-grove outline-none focus:border-leaf-500 focus:bg-white focus:ring-4 focus:ring-leaf-100"
                  disabled={isLoading}
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                Badge
                <select
                  value={badge}
                  onChange={(event) => updateFilter(setBadge, event.target.value)}
                  className="h-12 rounded-2xl border border-grove/10 bg-cream px-4 text-base font-normal text-grove outline-none focus:border-leaf-500 focus:bg-white focus:ring-4 focus:ring-leaf-100"
                  disabled={isLoading}
                >
                  {badges.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <p className="mt-6 rounded-2xl bg-leaf-50 p-4 text-sm font-medium leading-6 text-grove/70">
              {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouve
              {filteredProducts.length > 1 ? 's' : ''}
            </p>
          </aside>

          <div>
            {isLoading ? (
              <ProductsSkeleton />
            ) : error ? (
              <ProductsMessage title="Produits indisponibles" description={error} />
            ) : currentProducts.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {currentProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} onAddToCart={onAddToCart} />
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-grove/10 bg-white p-10 text-center shadow-soft">
                <p className="font-display text-2xl font-semibold text-grove">Aucun produit trouve</p>
                <p className="mt-3 text-grove/65">Essayez une autre recherche ou reinitialisez les filtres.</p>
                <button type="button" className="btn btn-primary mt-6" onClick={clearFilters}>
                  Reinitialiser
                </button>
              </div>
            )}

            {!isLoading && !error && (
              <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-[1.5rem] border border-grove/10 bg-white p-4 shadow-[0_1px_0_rgba(31,77,54,0.08)] sm:flex-row">
                <p className="text-sm font-medium text-grove/65">
                  Page {safePage} sur {totalPages} - {filteredProducts.length} produit
                  {filteredProducts.length > 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary min-h-11 px-4"
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    disabled={safePage === 1}
                  >
                    <ChevronLeft size={18} />
                    Precedent
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary min-h-11 px-4"
                    onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                    disabled={safePage === totalPages}
                  >
                    Suivant
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ index, onAddToCart, product }) {
  return (
    <motion.article
      className="group overflow-hidden rounded-[1.5rem] border border-grove/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lift"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.13em] text-grove shadow-soft backdrop-blur">
          {product.badge}
        </span>
      </div>
      <div className="p-5">
        <p className="text-sm font-medium text-grove/60">{product.category}</p>
        <span className="mt-3 inline-flex rounded-full bg-leaf-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-leaf-700">
          Pret a etre recupere
        </span>
        <div className="mt-2 flex items-start justify-between gap-4">
          <h3 className="font-display text-xl font-semibold text-grove">{product.name}</h3>
          <p className="shrink-0 font-display text-xl font-semibold text-grove">{product.price}</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary mt-5 w-full justify-center"
          onClick={() => onAddToCart(product)}
        >
          Ajouter a la commande
          <Plus size={17} />
        </button>
      </div>
    </motion.article>
  );
}

function ProductsSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-[1.5rem] border border-grove/10 bg-white">
          <div className="aspect-[4/3] animate-pulse bg-leaf-50" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-24 animate-pulse rounded-full bg-grove/10" />
            <div className="h-5 w-3/4 animate-pulse rounded-full bg-grove/10" />
            <div className="h-12 animate-pulse rounded-full bg-grove/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductsMessage({ description, title }) {
  return (
    <div className="rounded-[1.5rem] border border-grove/10 bg-white p-10 text-center shadow-soft">
      <p className="font-display text-2xl font-semibold text-grove">{title}</p>
      <p className="mx-auto mt-3 max-w-xl text-grove/65">{description}</p>
    </div>
  );
}
