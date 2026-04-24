import { motion, useReducedMotion } from 'framer-motion';

const floatingShapes = [
  {
    className: 'left-[-8rem] top-28 h-72 w-72 bg-leaf-300/35 blur-3xl sm:h-96 sm:w-96',
    animate: { x: [0, 46, -22, 0], y: [0, -38, 26, 0], scale: [1, 1.1, 0.97, 1] },
    duration: 16,
    delay: 0,
  },
  {
    className: 'right-[-10rem] top-[32rem] h-80 w-80 bg-citrus/18 blur-3xl sm:h-[30rem] sm:w-[30rem]',
    animate: { x: [0, -44, 26, 0], y: [0, 42, -24, 0], scale: [1, 0.95, 1.08, 1] },
    duration: 18,
    delay: 2.5,
  },
  {
    className: 'left-[18%] top-[58rem] hidden h-64 w-64 bg-white/45 blur-3xl md:block',
    animate: { x: [0, 34, -30, 0], y: [0, 32, -34, 0], scale: [1, 1.08, 0.96, 1] },
    duration: 20,
    delay: 5,
  },
  {
    className: 'bottom-24 right-[14%] hidden h-72 w-72 bg-leaf-400/20 blur-3xl lg:block',
    animate: { x: [0, -36, 24, 0], y: [0, -30, 38, 0], scale: [1, 1.09, 0.98, 1] },
    duration: 19,
    delay: 7,
  },
];

export function FloatingBackground() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden opacity-80 mix-blend-multiply" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(150,198,134,0.22),transparent_26%),radial-gradient(circle_at_86%_34%,rgba(245,165,36,0.12),transparent_24%)]" />

      {floatingShapes.map((shape, index) => (
        <motion.span
          key={index}
          className={`absolute rounded-full opacity-80 ${shape.className}`}
          animate={shouldReduceMotion ? undefined : shape.animate}
          transition={
            shouldReduceMotion
              ? undefined
              : {
                  duration: shape.duration,
                  delay: shape.delay,
                  ease: 'easeInOut',
                  repeat: Number.POSITIVE_INFINITY,
                }
          }
        />
      ))}
    </div>
  );
}
