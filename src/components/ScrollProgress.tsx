import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  const [isScrollable, setIsScrollable] = useState(false);

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: shouldReduceMotion ? 1000 : 140,
    damping: shouldReduceMotion ? 100 : 32,
    mass: 0.18,
  });

  useEffect(() => {
    const updateScrollableState = () => {
      const { documentElement } = document;
      setIsScrollable(documentElement.scrollHeight > documentElement.clientHeight + 4);
    };

    updateScrollableState();
    window.addEventListener('resize', updateScrollableState);
    window.addEventListener('scroll', updateScrollableState, { passive: true });

    return () => {
      window.removeEventListener('resize', updateScrollableState);
      window.removeEventListener('scroll', updateScrollableState);
    };
  }, []);

  if (!isScrollable) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100000] h-1 overflow-hidden bg-transparent"
      aria-hidden="true"
    >
      <motion.div
        className="h-full origin-left rounded-r-full bg-gradient-to-r from-leaf-600 via-leaf-400 to-citrus shadow-[0_0_18px_rgba(71,139,62,0.28)]"
        style={{ scaleX: smoothProgress }}
      />
    </div>
  );
}
