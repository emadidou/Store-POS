import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const whatsappMessage = encodeURIComponent('Bonjour, je souhaite passer une commande');

function useScrollDirection() {
  const [direction, setDirection] = useState<'up' | 'down'>('up');

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const updateDirection = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastY;

      if (Math.abs(delta) > 8) {
        setDirection(delta > 0 && currentY > 120 ? 'down' : 'up');
        lastY = currentY;
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return direction;
}

export function FloatingActions({ storeName = 'Maison Verde', phone }: { storeName?: string; phone?: string | null }) {
  const scrollDirection = useScrollDirection();
  const isCompact = scrollDirection === 'down';
  const [isMounted, setIsMounted] = useState(false);
  const phoneNumber = phone?.trim() ?? '';
  const whatsappNumber = phoneNumber.replace(/\D/g, '');
  const actions = [
    {
      label: 'Appeler',
      shortLabel: 'Call',
      href: `tel:${phoneNumber}`,
      Icon: Phone,
      iconClass: 'bg-[#123D2D] text-white shadow-[0_12px_26px_rgba(18,61,45,0.24)]',
      buttonClass: 'text-[#123D2D]',
    },
    {
      label: 'WhatsApp',
      shortLabel: 'WA',
      href: `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`,
      Icon: MessageCircle,
      iconClass: 'bg-[#25D366] text-white shadow-[0_12px_26px_rgba(37,211,102,0.22)]',
      buttonClass: 'text-[#14532d]',
      external: true,
    },
  ].filter((action) => phoneNumber && (!action.external || whatsappNumber));

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !phoneNumber) {
    return null;
  }

  return createPortal(
    <motion.div
      className="pointer-events-none fixed z-[99999] flex w-max flex-col items-end gap-3"
      style={{
        bottom: 'max(20px, calc(env(safe-area-inset-bottom, 0px) + 20px))',
        right: 'max(20px, calc(env(safe-area-inset-right, 0px) + 20px))',
      }}
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Actions rapides"
    >
      {actions.map((action, index) => (
        <FloatingButton key={action.label} action={action} index={index} isCompact={isCompact} storeName={storeName} />
      ))}
    </motion.div>,
    document.body,
  );
}

function FloatingButton({ action, index, isCompact, storeName }) {
  const { Icon, buttonClass, external, href, iconClass, label, shortLabel } = action;

  return (
    <motion.a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      aria-label={label === 'Appeler' ? `Appeler ${storeName}` : `Contacter ${storeName} sur WhatsApp`}
      className={`pointer-events-auto group inline-flex h-14 items-center overflow-hidden rounded-full border border-white/80 bg-white/92 shadow-[0_18px_44px_rgba(31,77,54,0.16)] backdrop-blur-xl transition-colors duration-300 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#DDEADF] sm:h-16 ${buttonClass}`}
      initial={{ opacity: 0, x: 16, scale: 0.94 }}
      animate={{
        opacity: 1,
        x: 0,
        scale: 1,
        width: isCompact ? 64 : 180,
      }}
      transition={{
        opacity: { delay: 0.25 + index * 0.08, duration: 0.35 },
        x: { delay: 0.25 + index * 0.08, duration: 0.35, ease: [0.22, 1, 0.36, 1] },
        scale: { duration: 0.22 },
        width: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
      }}
      whileHover={{ y: -3, scale: 1.025, boxShadow: '0 24px 58px rgba(31,77,54,0.22)' }}
      whileTap={{ scale: 0.965 }}
    >
      <span className="flex h-full w-full items-center gap-3 px-1.5 pr-4">
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full sm:h-[52px] sm:w-[52px] ${iconClass}`}
        >
          <Icon size={22} strokeWidth={1.9} />
        </span>

        <AnimatePresence initial={false}>
          {!isCompact && (
            <motion.span
              className="min-w-0 whitespace-nowrap text-[15px] font-semibold leading-none sm:text-base"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>

        <span className="sr-only">{shortLabel}</span>
      </span>
    </motion.a>
  );
}
