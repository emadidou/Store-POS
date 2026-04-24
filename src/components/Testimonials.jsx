import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { testimonials } from '../data/siteData.js';
import { Section, reveal } from './Section.jsx';

export function Testimonials() {
  return (
    <Section
      id="avis"
      eyebrow="Avis clients"
      title="Ils commandent avant, ils récupèrent sans attendre."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <motion.figure
            key={testimonial.name}
            className="rounded-[1.5rem] border border-grove/10 bg-white p-6 shadow-[0_1px_0_rgba(31,77,54,0.08)]"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            variants={reveal}
          >
            <div className="flex gap-1 text-citrus" aria-label={`${testimonial.rating} étoiles`}>
              {Array.from({ length: testimonial.rating }).map((_, starIndex) => (
                <Star key={starIndex} size={17} fill="currentColor" strokeWidth={1.6} />
              ))}
            </div>
            <blockquote className="mt-5 text-lg leading-8 text-grove/75">"{testimonial.quote}"</blockquote>
            <figcaption className="mt-6">
              <p className="font-display text-lg font-semibold text-grove">{testimonial.name}</p>
              <p className="mt-1 text-sm text-grove/60">{testimonial.role}</p>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </Section>
  );
}
