import { motion } from 'framer-motion';
import { Clock3, HandCoins, PackageCheck, Salad, Sparkles } from 'lucide-react';
import { Section, reveal } from './Section.jsx';

const benefits = [
  {
    title: 'Gain de temps',
    description: 'Commandez avant de partir et evitez l attente en magasin.',
    Icon: Clock3,
  },
  {
    title: 'Commande prête à l’arrivée',
    description: 'Votre panier est préparé, pesé et mis de côté avant votre passage.',
    Icon: PackageCheck,
  },
  {
    title: 'Produits frais sélectionnés',
    description: 'Chaque produit est choisi avec le même soin qu’au comptoir.',
    Icon: Salad,
  },
  {
    title: 'Retrait rapide',
    description: 'Un passage court, clair et pratique pour récupérer votre commande.',
    Icon: Sparkles,
  },
  {
    title: 'Service pratique',
    description: 'Une expérience simple pour organiser vos courses sans friction.',
    Icon: HandCoins,
  },
];

export function AvantagesRetrait() {
  return (
    <Section
      id="avantages"
      eyebrow="Avantages"
      title="Le service du primeur, avec une commande déjà préparée."
    >
      <div className="grid gap-4 md:grid-cols-5">
        {benefits.map(({ title, description, Icon }, index) => (
          <motion.div
            key={title}
            className="rounded-[1.35rem] border border-grove/10 bg-white p-5 shadow-[0_1px_0_rgba(31,77,54,0.08)]"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
            variants={reveal}
          >
            <div className="grid h-12 w-12 place-items-center rounded-full bg-leaf-50 text-leaf-700">
              <Icon size={22} strokeWidth={1.7} />
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold text-grove">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-grove/60">{description}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
