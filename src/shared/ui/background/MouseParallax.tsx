'use client';

import { useEffect } from 'react';
import { ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * Mouse parallax props configuration
 */
interface MouseParallaxProps {
  /** Content to apply parallax effect to */
  children: ReactNode;
  /** Max movement in pixels (default: 20) */
  strength?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * MouseParallax - Mouse-tracking parallax wrapper using useMotionValue
 *
 * Purpose: Creates smooth mouse-tracking parallax effect for background
 * elements. Movement is throttled to ~60fps using framer-motion's useSpring.
 *
 * Performance notes:
 * - Uses useMotionValue for zero-cost tracking
 * - useSpring throttles updates to ~60fps
 * - useTransform creates derived values efficiently
 * - useEffect with cleanup prevents memory leaks
 */
export function MouseParallax({
  children,
  strength = 20,
  className = '',
}: MouseParallaxProps) {
  // Motion values for mouse position (normalized -1 to 1)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring config for smooth, responsive movement
  const springConfig = { stiffness: 300, damping: 30, mass: 0.8 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // Transform normalized mouse position to pixel offset
  const translateX = useTransform(springX, [-0.5, 0.5], [-strength, strength]);
  const translateY = useTransform(springY, [-0.5, 0.5], [-strength, strength]);

  // Set up mouse move listener with proper cleanup
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position: -0.5 to 0.5
      const normalizedX = e.clientX / window.innerWidth - 0.5;
      const normalizedY = e.clientY / window.innerHeight - 0.5;

      x.set(normalizedX);
      y.set(normalizedY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []); // Empty deps - motion values are stable refs

  return (
    <motion.div
      className={className}
      style={{
        x: translateX,
        y: translateY,
      }}
    >
      {children}
    </motion.div>
  );
}
