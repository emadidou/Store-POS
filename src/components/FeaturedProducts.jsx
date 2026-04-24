import { motion } from 'framer-motion';
import { ArrowRight, Plus } from 'lucide-react';
import { useFeaturedProducts } from '../hooks/useCatalog';
import { Section, reveal } from './Section.jsx';

export function FeaturedProducts({ currency, onAddToCart, onNavigate }) {
  const { data: featuredProducts, error, isLoading } = useFeaturedProducts(currency);

  const handleAllProducts = (event) => {
    event.preventDefault();
    onNavigate('/produits');
  };

  return (
    <Section
      id="produits"
      className="bg-white"
      eyebrow="Produits vedettes"
      title="La selection qui part vite, cueillie ou recue ce matin."
      description="Des cartes simples, des prix visibles et des badges utiles pour reperer les meilleures opportunites."
    >
      {isLoading ? (
        <FeaturedProductsSkeleton />
      ) : error ? (
        <ProductsNotice title="Produits indisponibles" description={error} />
      ) : featuredProducts.length === 0 ? (
        <ProductsNotice title="Aucun produit vedette" description="Les produits vedettes ajoutes dans le back-office apparaitront ici." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}

      <div className="mt-10 flex justify-center">
        <a href="/produits" className="btn btn-primary" onClick={handleAllProducts}>
          Voir tous les produits
          <ArrowRight size={18} />
        </a>
      </div>
    </Section>
  );
}

function ProductCard({ index, onAddToCart, product }) {
  return (
    <motion.article
      className="group overflow-hidden rounded-[1.5rem] border border-grove/10 bg-cream transition duration-300 hover:-translate-y-1 hover:shadow-lift"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      variants={reveal}
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

function FeaturedProductsSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-[1.5rem] border border-grove/10 bg-cream">
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

function ProductsNotice({ description, title }) {
  return (
    <div className="rounded-[1.5rem] border border-grove/10 bg-cream p-8 text-center">
      <p className="font-display text-2xl font-semibold text-grove">{title}</p>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-grove/65">{description}</p>
    </div>
  );
}
