import { motion } from 'framer-motion';
import { HeartHandshake } from 'lucide-react';

export function About({ storeName = 'Maison Verde' }) {
  return (
    <section id="a-propos" className="section-pad bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow">
            <HeartHandshake size={17} />
            Notre maison
          </p>
          <h2 className="mt-5 font-display text-4xl font-semibold tracking-normal text-grove sm:text-5xl">
            Un primeur de proximité, organisé pour préparer vos commandes avec soin.
          </h2>
          <p className="mt-6 text-lg leading-8 text-grove/70">
            {storeName} travaille avec des producteurs suivis et des marchés de confiance. Chaque commande est préparée avant votre arrivée avec des produits choisis pour leur maturité, leur tenue et leur fraîcheur.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {['Préparation avant retrait', 'Arrivages contrôlés chaque matin', 'Paniers adaptés aux saisons', 'Service client direct'].map((item) => (
              <div key={item} className="rounded-2xl bg-cream p-4 text-sm font-semibold text-grove/75">
                {item}
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          className="relative overflow-hidden rounded-[2rem] shadow-soft"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=82"
            alt="Étal de primeur avec légumes colorés et frais"
            className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]"
            loading="lazy"
          />
        </motion.div>
      </div>
    </section>
  );
}
