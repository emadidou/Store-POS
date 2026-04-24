import { Facebook, Instagram, Mail, ShoppingBag } from 'lucide-react';
import { footerLinks } from '../data/siteData.js';

export function Footer({ storeName = 'Maison Verde', phone, email, address }) {
  const phoneNumber = phone?.trim();
  const emailAddress = email?.trim();

  return (
    <footer className="bg-grove text-cream">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.9fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-cream text-grove">
              <ShoppingBag size={20} strokeWidth={1.8} />
            </span>
            <span>
              <span className="block font-display text-lg font-semibold">{storeName}</span>
              <span className="block text-xs font-medium uppercase tracking-[0.18em] text-cream/60">Primeur local</span>
            </span>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-6 text-cream/70">
            Fruits, legumes, paniers bio et jus frais selectionnes avec soin pour une cuisine simple et savoureuse.
          </p>
          <div className="mt-5 space-y-1 text-sm text-cream/65">
            {address && <p>{address}</p>}
            {phoneNumber && <p><a className="transition hover:text-cream" href={`tel:${phoneNumber}`}>{phoneNumber}</a></p>}
            {emailAddress && <p><a className="transition hover:text-cream" href={`mailto:${emailAddress}`}>{emailAddress}</a></p>}
          </div>
          <div className="mt-6 flex gap-3">
            {[Instagram, Facebook, Mail].map((Icon, index) => (
              <a
                key={index}
                href="#contact"
                className="grid h-10 w-10 place-items-center rounded-full border border-cream/20 text-cream/80 transition hover:bg-cream hover:text-grove"
                aria-label={`Reseaux sociaux ${storeName}`}
              >
                <Icon size={18} strokeWidth={1.7} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold">Liens utiles</h3>
          <ul className="mt-5 grid gap-3 text-sm text-cream/70">
            {footerLinks.map((link) => (
              <li key={link}>
                <a href="#produits" className="transition hover:text-cream">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold">Horaires</h3>
          <p className="mt-5 text-sm text-cream/60">Lun - Sam, 8h00 - 19h30</p>
        </div>
      </div>
      <div className="border-t border-cream/10 px-5 py-5 text-center text-xs text-cream/50">
        © 2026 {storeName}. Tous droits reserves.
      </div>
    </footer>
  );
}
