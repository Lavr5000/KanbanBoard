'use client';

import { ReactNode, useState } from 'react';
import { useSwipeGestures } from '../hooks/useSwipeGestures';

interface SwipeableTaskCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
  swipeThreshold?: number;
  swipeLeftBackground?: string;
  swipeRightBackground?: string;
}

export function SwipeableTaskCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = '',
  swipeThreshold = 60,
  swipeLeftBackground = 'bg-green-500',
  swipeRightBackground = 'bg-blue-500',
}: SwipeableTaskCardProps) {
  const [swipeDelta, setSwipeDelta] = useState(0);

  const swipeHandlers = useSwipeGestures({
    onSwipeLeft,
    onSwipeRight,
    onSwipeMove: (deltaX, deltaY) => {
      setSwipeDelta(deltaX);
    },
    threshold: swipeThreshold,
  });

  // Calculate opacity based on swipe progress
  const swipeProgress = Math.min(Math.abs(swipeDelta) / swipeThreshold, 1);
  const isSwipingLeft = swipeDelta < 0;
  const isSwipingRight = swipeDelta > 0;

  // Background color based on swipe direction
  const getBackgroundColor = () => {
    if (swipeProgress > 0.1) {
      if (isSwipingLeft && onSwipeLeft) {
        return swipeLeftBackground;
      }
      if (isSwipingRight && onSwipeRight) {
        return swipeRightBackground;
      }
    }
    return '';
  };

  return (
    <div
      {...swipeHandlers}
      className={`relative active:scale-[0.98] transition-transform ${className}`}
      style={{
        transform: `translateX(${swipeDelta}px)`,
        transition: swipeDelta === 0 ? 'transform 0.2s ease-out' : 'none',
      }}
    >
      {/* Swipe indicator background */}
      {getBackgroundColor() && (
        <div
          className={`absolute inset-0 rounded-xl opacity-20 pointer-events-none transition-opacity ${getBackgroundColor()}`}
          style={{
            opacity: swipeProgress * 0.3,
          }}
        />
      )}

      {children}

      {/* Swipe progress indicator */}
      {swipeProgress > 0.1 && (
        <div
          className={`absolute bottom-2 ${isSwipingLeft ? 'left-2' : 'right-2'} w-8 h-1 rounded-full opacity-50 pointer-events-none`}
          style={{
            backgroundColor: isSwipingLeft ? '#22c55e' : '#3b82f6',
            width: `${swipeProgress * 32}px`,
          }}
        />
      )}
    </div>
  );
}
