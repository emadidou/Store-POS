import { motion } from 'framer-motion';
import { Clock3, MapPin, PackageCheck, Phone, Send } from 'lucide-react';
import { useState } from 'react';

export function Contact({ storeSettings }) {
  const phoneNumber = storeSettings?.phone?.trim() ?? '';
  const email = storeSettings?.email?.trim() ?? '';
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [feedback, setFeedback] = useState('');
  const contactItems = [
    { label: 'Adresse', value: storeSettings?.address || 'Adresse du magasin', Icon: MapPin },
    { label: 'Telephone', value: phoneNumber || 'Telephone non renseigne', Icon: Phone, href: phoneNumber ? `tel:${phoneNumber}` : undefined },
    { label: 'Horaires', value: 'Consultez les creneaux de retrait lors de votre commande.', Icon: Clock3 },
    { label: 'Retrait', value: "Commandes preparees selon l'heure indiquee", Icon: PackageCheck },
  ];

  const submitContact = (event) => {
    event.preventDefault();

    if (!email) {
      setFeedback('Contact email non configure pour le moment.');
      return;
    }

    const subject = encodeURIComponent(`Demande client - ${form.name || 'Sans nom'}`);
    const body = encodeURIComponent([
      `Nom: ${form.name || '-'}`,
      `Email: ${form.email || '-'}`,
      '',
      form.message || '',
    ].join('\n'));

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setFeedback(`Ouverture de votre messagerie vers ${email}.`);
  };

  return (
    <section id="contact" className="section-pad bg-linen/70">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow">Contact & localisation</p>
          <h2 className="mt-5 font-display text-4xl font-semibold tracking-normal text-grove sm:text-5xl">
            Indiquez votre heure de retrait, nous preparons votre commande.
          </h2>
          <p className="mt-5 text-lg leading-8 text-grove/70">
            Une question sur un panier, un arrivage ou un produit precis ? Laissez un message, l'equipe vous repond rapidement.
          </p>

          <div className="mt-8 grid gap-3">
            {contactItems.map(({ label, value, Icon, href }) => (
              <div key={label} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_1px_0_rgba(31,77,54,0.08)]">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-leaf-50 text-leaf-700">
                  <Icon size={20} strokeWidth={1.7} />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-grove/50">{label}</span>
                  {href ? (
                    <a className="mt-1 block font-medium text-grove transition hover:text-leaf-700" href={href}>{value}</a>
                  ) : (
                    <span className="mt-1 block font-medium text-grove">{value}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="grid gap-5 lg:grid-cols-[1fr_0.85fr]"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <form className="rounded-[1.5rem] bg-white p-5 shadow-soft sm:p-7" onSubmit={submitContact}>
            <div className="grid gap-4">
              <label className="form-field">
                Nom
                <input type="text" name="name" placeholder="Votre nom" autoComplete="name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              </label>
              <label className="form-field">
                Email
                <input type="email" name="email" placeholder="vous@email.com" autoComplete="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
              </label>
              <label className="form-field">
                Message
                <textarea name="message" rows="5" placeholder="Votre demande" value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} />
              </label>
              {feedback && <p className="rounded-2xl bg-cream p-3 text-sm font-semibold text-grove/70">{feedback}</p>}
              <button type="submit" className="btn btn-primary justify-center">
                Envoyer
                <Send size={17} />
              </button>
            </div>
          </form>

          <div className="relative min-h-[360px] overflow-hidden rounded-[1.5rem] bg-grove p-6 text-cream shadow-soft">
            <img
              src="https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=900&q=80"
              alt="Devanture de marche primeur"
              className="absolute inset-0 h-full w-full object-cover opacity-58"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-grove/60" />
            <div className="relative flex h-full flex-col justify-end">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cream/70">Zone locale</p>
              <p className="mt-3 font-display text-3xl font-semibold">Retrait rapide en magasin.</p>
              <p className="mt-3 text-sm leading-6 text-cream/75">Votre commande est pesee, regroupee et mise de cote avant votre arrivee.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
