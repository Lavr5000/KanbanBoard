'use client';

import { ReactNode } from 'react';
import { clsx } from 'clsx';
import type { GlassPanelProps } from './types';

/**
 * Variant classes mapping for glass panel appearance
 *
 * - default: Standard glass effect with backdrop blur
 * - light: Brighter variant for high visibility
 * - dark: Subtler variant for background panels
 */
const variantClasses = {
  default: 'glass glass-optimized',
  light: 'glass-card',
  dark: 'glass-dark',
} as const;

/**
 * GlassPanel - Glassmorphism panel container component
 *
 * Purpose: Provides reusable glass panel for columns, containers,
 * and section dividers with configurable variants.
 *
 * Features:
 * - Three visual variants (default/light/dark)
 * - Configurable via className prop
 * - Safari-compatible with -webkit-backdrop-filter
 * - GPU-optimized rendering
 *
 * @example
 * ```tsx
 * <GlassPanel variant="default">
 *   <p>Default panel content</p>
 * </GlassPanel>
 *
 * <GlassPanel variant="light" className="p-6">
 *   <p>Light panel with custom padding</p>
 * </GlassPanel>
 * ```
 */
export function GlassPanel({
  children,
  variant = 'default',
  className,
}: GlassPanelProps) {
  const variantClass = variantClasses[variant];

  return (
    <div
      className={clsx('rounded-xl p-4', variantClass, className)}
      style={{
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {children}
    </div>
  );
}
