import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBasket } from 'lucide-react';

export function CommandeExpress({ onNavigate }) {
  const handleOrder = (event) => {
    event.preventDefault();
    onNavigate('/produits');
  };

  return (
    <section className="section-pad bg-linen/70">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <motion.div
          className="grid gap-8 overflow-hidden rounded-[2rem] border border-grove/10 bg-white p-6 shadow-soft sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <p className="eyebrow">
              <ShoppingBasket size={17} />
              Commande express
            </p>
            <h2 className="mt-4 max-w-3xl font-display text-3xl font-semibold tracking-normal text-grove sm:text-4xl">
              Commandez en quelques minutes, récupérez sans attendre
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-grove/70">
              Sélectionnez vos produits frais, indiquez votre heure de retrait et passez en boutique quand tout est prêt.
            </p>
          </div>
          <a href="/produits" className="btn btn-primary justify-center" onClick={handleOrder}>
            Passer ma commande
            <ArrowRight size={18} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
