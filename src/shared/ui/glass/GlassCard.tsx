'use client';

import { clsx } from 'clsx';
import type { GlassCardProps } from './types';

export function GlassCard({
  children,
  variant = 'default',
  className,
  blurLevel = 'xl',
  interactive = false,
}: GlassCardProps) {
  // Base glass utility class
  const baseClass = 'glass-optimized';

  // Variant-specific classes
  const variantClasses = {
    default: 'glass',
    light: 'glass-card',
    dark: 'glass-dark',
  };

  // Blur level classes (fallback for Tailwind backdrop-blur utilities)
  const blurClasses = {
    none: '',
    xs: 'backdrop-blur-xs',
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
    '2xl': 'backdrop-blur-2xl',
  };

  // Interactive hover effect
  const interactiveClasses = interactive
    ? 'hover:bg-white/15 transition-colors duration-[var(--duration-normal)]'
    : '';

  return (
    <div
      className={clsx(
        baseClass,
        variantClasses[variant],
        blurClasses[blurLevel],
        interactiveClasses,
        className
      )}
    >
      {children}
    </div>
  );
}
