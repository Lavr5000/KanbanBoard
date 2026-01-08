'use client';

import { useEffect, useRef, useCallback } from 'react';

export interface UseSwipeGesturesProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Minimum distance in pixels to trigger swipe (default: 60)
  preventDefaultOnSwipe?: boolean; // Prevent default behavior on swipe
}

interface TouchCoordinates {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

/**
 * Custom hook for handling swipe gestures on touch devices
 * Supports horizontal and vertical swipes with configurable thresholds
 */
export function useSwipeGestures({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 60,
  preventDefaultOnSwipe = true,
}: UseSwipeGesturesProps) {
  const touchCoords = useRef<TouchCoordinates>({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  });

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    touchCoords.current = {
      startX: touch.screenX,
      startY: touch.screenY,
      endX: touch.screenX,
      endY: touch.screenY,
    };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    touchCoords.current = {
      ...touchCoords.current,
      endX: touch.screenX,
      endY: touch.screenY,
    };
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const { startX, startY, endX, endY } = touchCoords.current;

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Check if threshold is met
    if (Math.max(absDeltaX, absDeltaY) < threshold) {
      return; // Swipe distance too short
    }

    // Determine swipe direction based on dominant axis
    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      if (deltaX > 0) {
        // Swipe right
        if (onSwipeRight) {
          if (preventDefaultOnSwipe) {
            e.preventDefault();
          }
          onSwipeRight();
          triggerHapticFeedback();
        }
      } else {
        // Swipe left
        if (onSwipeLeft) {
          if (preventDefaultOnSwipe) {
            e.preventDefault();
          }
          onSwipeLeft();
          triggerHapticFeedback();
        }
      }
    } else {
      // Vertical swipe
      if (deltaY > 0) {
        // Swipe down
        if (onSwipeDown) {
          if (preventDefaultOnSwipe) {
            e.preventDefault();
          }
          onSwipeDown();
          triggerHapticFeedback();
        }
      } else {
        // Swipe up
        if (onSwipeUp) {
          if (preventDefaultOnSwipe) {
            e.preventDefault();
          }
          onSwipeUp();
          triggerHapticFeedback();
        }
      }
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, preventDefaultOnSwipe]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}

/**
 * Trigger haptic feedback if device supports it
 */
function triggerHapticFeedback(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(10); // Short 10ms vibration
    } catch (error) {
      // Ignore errors (e.g., if permission is denied)
      console.debug('Haptic feedback not available:', error);
    }
  }
}

/**
 * Hook variant for mouse events (for testing on desktop)
 */
export function useMouseSwipeGestures(props: UseSwipeGesturesProps) {
  const mouseCoords = useRef({ startX: 0, startY: 0 });
  const isDragging = useRef(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    mouseCoords.current = {
      startX: e.clientX,
      startY: e.clientY,
    };
    isDragging.current = true;
  }, []);

  const onMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;

    const { startX, startY } = mouseCoords.current;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    const threshold = props.threshold || 60;

    if (Math.max(absDeltaX, absDeltaY) < threshold) {
      isDragging.current = false;
      return;
    }

    if (absDeltaX > absDeltaY) {
      if (deltaX > 0 && props.onSwipeRight) {
        props.onSwipeRight();
      } else if (deltaX < 0 && props.onSwipeLeft) {
        props.onSwipeLeft();
      }
    } else {
      if (deltaY > 0 && props.onSwipeDown) {
        props.onSwipeDown();
      } else if (deltaY < 0 && props.onSwipeUp) {
        props.onSwipeUp();
      }
    }

    isDragging.current = false;
  }, [props]);

  return {
    onMouseDown,
    onMouseUp,
  };
}
