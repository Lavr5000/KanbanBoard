'use client';

import { ReactNode } from 'react';
import { useSwipeGestures } from '../hooks/useSwipeGestures';

interface SwipeableTaskCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
  swipeThreshold?: number;
}

export function SwipeableTaskCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = '',
  swipeThreshold = 60,
}: SwipeableTaskCardProps) {
  const swipeHandlers = useSwipeGestures({
    onSwipeLeft,
    onSwipeRight,
    threshold: swipeThreshold,
  });

  return (
    <div
      {...swipeHandlers}
      className={`active:scale-[0.98] transition-transform ${className}`}
    >
      {children}
    </div>
  );
}
