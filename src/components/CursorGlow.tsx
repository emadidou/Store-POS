import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

export function CursorGlow() {
  const shouldReduceMotion = useReducedMotion();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isCtaHover, setIsCtaHover] = useState(false);
  const mouseX = useMotionValue(-240);
  const mouseY = useMotionValue(-240);
  const velocity = useMotionValue(0);

  const glowX = useSpring(mouseX, { stiffness: 55, damping: 24, mass: 0.7 });
  const glowY = useSpring(mouseY, { stiffness: 55, damping: 24, mass: 0.7 });
  const scale = useTransform(velocity, [0, 80], [1, 1.08], { clamp: true });

  useEffect(() => {
    if (shouldReduceMotion) {
      setIsEnabled(false);
      return;
    }

    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const updateEnabled = () => setIsEnabled(mediaQuery.matches);

    updateEnabled();
    mediaQuery.addEventListener('change', updateEnabled);

    return () => mediaQuery.removeEventListener('change', updateEnabled);
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (!isEnabled) {
      setIsVisible(false);
      return undefined;
    }

    let lastX = 0;
    let lastY = 0;
    let lastTime = performance.now();
    let velocityFrame = 0;

    const updateVelocity = (nextVelocity: number) => {
      window.cancelAnimationFrame(velocityFrame);
      velocityFrame = window.requestAnimationFrame(() => {
        velocity.set(nextVelocity);
      });
    };

    const handlePointerMove = (event: PointerEvent) => {
      const now = performance.now();
      const deltaTime = Math.max(now - lastTime, 16);
      const distance = Math.hypot(event.clientX - lastX, event.clientY - lastY);
      const nextVelocity = Math.min((distance / deltaTime) * 16, 80);

      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
      updateVelocity(nextVelocity);
      setIsVisible(true);

      lastX = event.clientX;
      lastY = event.clientY;
      lastTime = now;
    };

    const handlePointerLeave = () => setIsVisible(false);
    const handlePointerEnter = () => setIsVisible(true);
    const handlePointerOver = (event: PointerEvent) => {
      const target = event.target;
      setIsCtaHover(target instanceof Element && Boolean(target.closest('.btn')));
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('pointerenter', handlePointerEnter);
    document.addEventListener('pointerover', handlePointerOver, { passive: true });

    return () => {
      window.cancelAnimationFrame(velocityFrame);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('pointerenter', handlePointerEnter);
      document.removeEventListener('pointerover', handlePointerOver);
    };
  }, [glowX, glowY, isEnabled, mouseX, mouseY, velocity]);

  if (!isEnabled) {
    return null;
  }

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[3] h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(105,169,91,0.46)_0%,rgba(150,198,134,0.28)_26%,rgba(245,165,36,0.2)_48%,rgba(251,248,239,0.1)_64%,transparent_76%)] blur-xl"
      aria-hidden="true"
      style={{
        x: glowX,
        y: glowY,
        scale,
        marginLeft: -192,
        marginTop: -192,
      }}
      animate={{
        opacity: isVisible ? (isCtaHover ? 0.56 : 0.42) : 0,
      }}
      transition={{ opacity: { duration: 0.35, ease: 'easeOut' } }}
    />
  );
}
