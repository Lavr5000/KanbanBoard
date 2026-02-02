'use client';

import { motion } from 'framer-motion';

/**
 * Glow orb props configuration
 */
interface GlowOrbProps {
  /** Size in pixels (default: 300) */
  size?: number;
  /** Color as CSS string (default: purple glow) */
  color?: string;
  /** Top position (CSS value) */
  top?: string;
  /** Left position (CSS value) */
  left?: string;
  /** Right position (CSS value) */
  right?: string;
  /** Bottom position (CSS value) */
  bottom?: string;
  /** Entrance animation delay in seconds */
  delay?: number;
}

const DEFAULTS = {
  size: 300,
  color: 'rgba(168, 85, 247, 0.3)', // purple glow
  top: '50%',
  left: '50%',
  delay: 0,
} as const;

/**
 * GlowOrb - Ambient lighting orb for atmospheric backgrounds
 *
 * Purpose: Provides large, soft, slowly floating colored orbs that create
 * ambient lighting. Multiple orbs with different colors/sizes blend into
 * each other for atmospheric effect.
 */
export function GlowOrb({
  size = DEFAULTS.size,
  color = DEFAULTS.color,
  top,
  left,
  right,
  bottom,
  delay = DEFAULTS.delay,
}: GlowOrbProps) {
  // Build position styles
  const positionStyles: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    background: `radial-gradient(circle, ${color}, transparent)`,
    willChange: 'transform, opacity', // GPU hint for entrance animation
  };

  // Add positioning props if provided
  if (top !== undefined) positionStyles.top = top;
  if (left !== undefined) positionStyles.left = left;
  if (right !== undefined) positionStyles.right = right;
  if (bottom !== undefined) positionStyles.bottom = bottom;

  // Add center transform for better positioning
  if (left !== undefined || right !== undefined) {
    positionStyles.transform = 'translate(-50%, -50%)';
  }

  return (
    <motion.div
      className="rounded-full blur-3xl pointer-events-none -z-10 fixed"
      style={positionStyles}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay,
        duration: 1,
        ease: 'easeOut',
      }}
    />
  );
}
