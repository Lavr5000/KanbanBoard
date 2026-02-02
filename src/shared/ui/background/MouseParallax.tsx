'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

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
 * MouseParallax - Mouse-tracking parallax with CSS transform
 *
 * Purpose: Creates smooth mouse-tracking parallax effect for background
 * elements. Uses requestAnimationFrame for smooth 60fps updates.
 *
 * Performance notes:
 * - Uses requestAnimationFrame for smooth updates
 * - CSS transform for GPU acceleration
 * - Cleanup prevents memory leaks
 */
export function MouseParallax({
  children,
  strength = 20,
  className = '',
}: MouseParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('translate(0px, 0px)');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const element = ref.current;
    if (!element) return;

    let rafId: number;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position: -0.5 to 0.5
      targetX = (e.clientX / window.innerWidth - 0.5) * strength * -1;
      targetY = (e.clientY / window.innerHeight - 0.5) * strength * -1;
    };

    const animate = () => {
      // Smooth interpolation (ease-out)
      const factor = 0.1;
      currentX += (targetX - currentX) * factor;
      currentY += (targetY - currentY) * factor;

      setTransform(`translate(${currentX.toFixed(1)}px, ${currentY.toFixed(1)}px)`);
      rafId = requestAnimationFrame(animate);
    };

    // Start animation loop
    rafId = requestAnimationFrame(animate);

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [strength]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform,
        transition: 'transform 0.1s ease-out',
      }}
    >
      {children}
    </div>
  );
}
