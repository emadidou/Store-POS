import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useStoreStatus } from '../hooks/useStoreStatus';

type LiveIndicatorProps = {
  className?: string;
  showDetail?: boolean;
};

export function LiveIndicator({
  className = '',
  showDetail = false,
}: LiveIndicatorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const status = useStoreStatus();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const message = status.label;
  const detail = showDetail ? status.detail : null;
  const ariaLabel = detail
    ? `${status.isOpen ? 'Magasin ouvert' : 'Magasin ferme'}. ${message}. ${detail}.`
    : `${status.isOpen ? 'Magasin ouvert' : 'Magasin ferme'}. ${message}.`;
  const glowAnimation = shouldReduceMotion
    ? { opacity: 1, scale: 1, boxShadow: status.isOpen ? '0 18px 40px rgba(71,139,62,0.16)' : '0 16px 36px rgba(31,77,54,0.10)' }
    : status.isOpen
      ? {
          opacity: [0.96, 1, 0.97, 0.96],
          scale: [1, 1.018, 1.006, 1],
          boxShadow: [
            '0 16px 36px rgba(71,139,62,0.12)',
            '0 20px 42px rgba(71,139,62,0.18)',
            '0 17px 38px rgba(71,139,62,0.14)',
            '0 16px 36px rgba(71,139,62,0.12)',
          ],
        }
      : {
          opacity: 0.92,
          scale: 1,
          boxShadow: '0 16px 36px rgba(31,77,54,0.10)',
        };

  return createPortal(
    <div
      className={`pointer-events-none fixed z-[99990] ${className}`}
      style={{
        right: 'max(20px, calc(env(safe-area-inset-right, 0px) + 20px))',
        top: 'max(96px, calc(env(safe-area-inset-top, 0px) + 96px))',
        maxWidth: 'min(340px, calc(100vw - 40px))',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          role="status"
          aria-live="polite"
          aria-label={ariaLabel}
          className={`relative overflow-hidden rounded-full border px-4 py-3 backdrop-blur-xl ${
            status.isOpen
              ? 'border-leaf-500/20 bg-white/78 text-leaf-700'
              : 'border-grove/10 bg-white/74 text-grove/80'
          }`}
          animate={glowAnimation}
          transition={
            shouldReduceMotion
              ? { duration: 0.2 }
              : status.isOpen
                ? { duration: 4.3, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }
                : { duration: 0.3 }
          }
        >
          <div
            className={`absolute inset-0 ${
              status.isOpen ? 'bg-gradient-to-r from-leaf-50/70 via-white/10 to-transparent' : 'bg-gradient-to-r from-white/55 via-transparent to-transparent'
            }`}
          />

          <div className="relative flex items-start gap-3">
            <motion.span
              className="relative mt-1 flex h-3 w-3 shrink-0"
              animate={
                shouldReduceMotion || !status.isOpen
                  ? { scale: 1, opacity: 1 }
                  : { scale: [1, 1.18, 1], opacity: [0.82, 1, 0.82] }
              }
              transition={
                shouldReduceMotion || !status.isOpen
                  ? { duration: 0.2 }
                  : { duration: 3.8, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }
              }
            >
              <span
                className={`absolute inset-0 rounded-full ${
                  status.isOpen ? 'bg-leaf-400/30' : 'bg-tomato/20'
                }`}
              />
              <span
                className={`absolute inset-[2px] rounded-full ${
                  status.isOpen ? 'bg-leaf-500' : 'bg-tomato'
                }`}
              />
            </motion.span>

            <div className="min-w-0">
              <p className="text-[13px] font-semibold leading-none sm:text-sm">{message}</p>
              {detail && (
                <p className="mt-1 text-xs font-medium leading-5 text-grove/60 sm:text-[13px]">{detail}</p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>,
    document.body,
  );
}
