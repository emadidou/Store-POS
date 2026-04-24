import { motion } from 'framer-motion';
import { useCategories, useProducts } from '../hooks/useCatalog';
import { Section, reveal } from './Section.jsx';

export function Categories() {
  const { data: products } = useProducts();
  const { data: categories, error, isLoading } = useCategories(products);

  return (
    <Section
      id="categories"
      eyebrow="Rayons frais"
      title="Tout pour composer une commande fraiche, simple et prete a recuperer."
      description="Des rayons lisibles, des produits de saison et des paniers pratiques pour commander sans hesitation."
    >
      {isLoading ? (
        <CategoriesSkeleton />
      ) : error ? (
        <div className="rounded-[1.5rem] border border-grove/10 bg-white p-8 text-center shadow-soft">
          <p className="font-display text-2xl font-semibold text-grove">Categories indisponibles</p>
          <p className="mt-3 text-sm leading-6 text-grove/65">{error}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map(({ title, count, description, image, Icon }, index) => (
            <motion.a
              href="#produits"
              key={title}
              className="group overflow-hidden rounded-[1.5rem] bg-white shadow-[0_1px_0_rgba(31,77,54,0.08)] ring-1 ring-grove/8 transition duration-300 hover:-translate-y-1 hover:shadow-lift"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              variants={reveal}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={image}
                  alt={`Categorie ${title}`}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-cream/90 text-grove shadow-soft backdrop-blur">
                  <Icon size={20} strokeWidth={1.7} />
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-semibold text-grove">{title}</h3>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-citrus">{count}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-grove/70">{description}</p>
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </Section>
  );
}

function CategoriesSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-[1.5rem] bg-white shadow-[0_1px_0_rgba(31,77,54,0.08)] ring-1 ring-grove/8">
          <div className="aspect-[4/3] animate-pulse bg-leaf-50" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-2/3 animate-pulse rounded-full bg-grove/10" />
            <div className="h-3 w-full animate-pulse rounded-full bg-grove/10" />
            <div className="h-3 w-4/5 animate-pulse rounded-full bg-grove/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
