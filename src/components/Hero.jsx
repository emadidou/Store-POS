import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, CheckCircle2, ShoppingBasket } from 'lucide-react';

export function Hero({ onNavigate }) {
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 520], [0, 58]);

  const handleOrder = (event) => {
    event.preventDefault();
    onNavigate('/produits');
  };

  return (
    <section id="accueil" className="relative min-h-[92vh] overflow-hidden bg-cream pt-24">
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-linen to-transparent" />
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:pb-24 lg:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10"
        >
          <p className="eyebrow">
            <CheckCircle2 size={17} />
            Commande en ligne, retrait rapide en magasin
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-5xl font-semibold leading-[1.04] tracking-normal text-grove sm:text-6xl lg:text-7xl">
            Commandez vos produits frais à l’avance et récupérez-les sans attendre
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-grove/70 sm:text-xl">
            Préparez votre commande en ligne, nous la préparons avant votre arrivée, vous n’avez plus qu’à la récupérer.
          </p>
          <motion.div
            className="mt-8 flex flex-col gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <a href="/produits" className="btn btn-primary" onClick={handleOrder}>
              Commander maintenant
              <ShoppingBasket size={18} />
            </a>
            <a href="#produits" className="btn btn-secondary">
              Voir les produits
              <ArrowRight size={18} />
            </a>
          </motion.div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {[
              ['10 min', 'commande simple'],
              ['Prêt', 'avant arrivée'],
              ['Rapide', 'retrait magasin'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-grove/10 bg-white/70 p-4 backdrop-blur">
                <span className="block font-display text-2xl font-semibold text-grove">{value}</span>
                <span className="mt-1 block text-xs font-medium uppercase tracking-[0.12em] text-grove/50">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          style={{ y: imageY }}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.95, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="relative aspect-[4/5] max-h-[720px] overflow-hidden rounded-[2rem] shadow-soft sm:aspect-[5/4] lg:aspect-[4/5]">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=82"
              alt="Étal de fruits et légumes frais soigneusement présentés"
              className="h-full w-full object-cover"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-grove/40 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 rounded-3xl bg-cream/90 p-5 shadow-lift backdrop-blur-md sm:bottom-7 sm:left-7 sm:right-auto sm:max-w-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-citrus">Retrait express</p>
              <p className="mt-2 font-display text-2xl font-semibold text-grove">Commande prête en boutique</p>
              <p className="mt-2 text-sm leading-6 text-grove/70">Préparée avec soin avant votre passage.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
