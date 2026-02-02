'use client';

import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

/**
 * StaggerChildren wrapper component for cascading animations.
 *
 * Creates a container that animates children in sequence with a staggered delay.
 * Each child must be a motion component with the variants prop set to itemVariants.
 *
 * @example
 * ```tsx
 * import { StaggerChildren, itemVariants } from '@/shared/ui/animations';
 * import { motion } from 'framer-motion';
 *
 * <StaggerChildren staggerDelay={0.1}>
 *   {items.map((item) => (
 *     <motion.div
 *       key={item.id}
 *       variants={itemVariants}
 *       className="p-4 bg-white/10 rounded"
 *     >
 *       {item.content}
 *     </motion.div>
 *   ))}
 * </StaggerChildren>
 * ```
 */

export interface StaggerChildrenProps {
  /** Children to animate in sequence */
  children: ReactNode;
  /** Delay between each child animation (default: 0.05 seconds) */
  staggerDelay?: number;
  /** Additional className for the container */
  className?: string;
}

/**
 * Factory function to create container variants with custom stagger delay.
 * Using a factory allows the staggerDelay to be configurable at runtime.
 */
const createContainerVariants = (staggerDelay: number): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: staggerDelay,
    },
  },
});

/**
 * Item variants for child elements.
 *
 * Children of StaggerChildren must use these variants for the stagger effect to work.
 * Each child will fade in and slide up with spring physics.
 *
 * @example
 * ```tsx
 * <motion.div variants={itemVariants}>Content</motion.div>
 * ```
 */
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
};

/**
 * StaggerChildren component
 *
 * Wraps children to create a cascading animation effect.
 * The container fades in first, then children animate in sequence.
 */
export const StaggerChildren: React.FC<StaggerChildrenProps> = ({
  children,
  staggerDelay = 0.05,
  className = '',
}) => {
  const containerVariants = createContainerVariants(staggerDelay);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
};
