import { motion } from 'framer-motion';
import { ClipboardList, PackageCheck, Store } from 'lucide-react';
import { Section, reveal } from './Section.jsx';

const steps = [
  {
    title: 'Choisissez vos produits',
    description: 'Ajoutez fruits, légumes et paniers à votre commande en quelques clics.',
    Icon: ClipboardList,
  },
  {
    title: 'Nous préparons votre commande',
    description: 'L’équipe sélectionne les produits frais et prépare votre panier avant votre arrivée.',
    Icon: PackageCheck,
  },
  {
    title: 'Récupérez-la sans attendre',
    description: 'Passez en magasin, votre commande est déjà prête pour un retrait rapide.',
    Icon: Store,
  },
];

export function HowItWorks() {
  return (
    <Section
      id="comment-ca-marche"
      className="bg-white"
      eyebrow="Comment ça marche"
      title="Une commande prête avant votre passage."
      description="Un parcours simple pour gagner du temps tout en gardant la fraîcheur et le service du primeur."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map(({ title, description, Icon }, index) => (
          <motion.article
            key={title}
            className="rounded-[1.5rem] border border-grove/10 bg-cream p-6 shadow-[0_1px_0_rgba(31,77,54,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-lift"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            variants={reveal}
          >
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-grove text-cream">
                <Icon size={21} strokeWidth={1.7} />
              </span>
              <span className="font-display text-3xl font-semibold text-citrus">0{index + 1}</span>
            </div>
            <h3 className="mt-6 font-display text-xl font-semibold text-grove">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-grove/65">{description}</p>
          </motion.article>
        ))}
      </div>
    </Section>
  );
}
