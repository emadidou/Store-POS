import { motion } from 'framer-motion';

const variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export function Section({ id, eyebrow, title, description, children, className = '' }) {
  return (
    <section id={id} className={`section-pad ${className}`}>
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {(eyebrow || title || description) && (
          <motion.div
            className="mx-auto mb-10 max-w-3xl text-center sm:mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            variants={variants}
          >
            {eyebrow && <p className="eyebrow justify-center">{eyebrow}</p>}
            {title && (
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-normal text-grove sm:text-4xl">
                {title}
              </h2>
            )}
            {description && <p className="mt-4 text-base leading-7 text-grove/70">{description}</p>}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
}

export const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};
