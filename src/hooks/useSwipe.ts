'use client'

import { useState, useCallback, useRef } from 'react'

interface SwipeState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  deltaX: number
  deltaY: number
  isSwiping: boolean
  direction: 'left' | 'right' | 'up' | 'down' | null
}

interface UseSwipeOptions {
  threshold?: number // Minimum distance to trigger swipe
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onSwipeStart?: () => void
  onSwipeEnd?: (direction: SwipeState['direction']) => void
}

/**
 * Hook for handling swipe gestures on touch devices
 */
export function useSwipe(options: UseSwipeOptions = {}) {
  const {
    threshold = 50,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipeStart,
    onSwipeEnd,
  } = options

  const [swipeState, setSwipeState] = useState<SwipeState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    isSwiping: false,
    direction: null,
  })

  const startRef = useRef({ x: 0, y: 0 })

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    startRef.current = { x: touch.clientX, y: touch.clientY }

    setSwipeState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      isSwiping: true,
      direction: null,
    })

    onSwipeStart?.()
  }, [onSwipeStart])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    const deltaX = touch.clientX - startRef.current.x
    const deltaY = touch.clientY - startRef.current.y

    // Determine swipe direction
    let direction: SwipeState['direction'] = null
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left'
    } else {
      direction = deltaY > 0 ? 'down' : 'up'
    }

    setSwipeState(prev => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX,
      deltaY,
      direction,
    }))
  }, [])

  const handleTouchEnd = useCallback(() => {
    setSwipeState(prev => {
      const { deltaX, deltaY, direction } = prev

      // Check if swipe exceeds threshold
      if (Math.abs(deltaX) >= threshold || Math.abs(deltaY) >= threshold) {
        if (direction === 'left') onSwipeLeft?.()
        if (direction === 'right') onSwipeRight?.()
        if (direction === 'up') onSwipeUp?.()
        if (direction === 'down') onSwipeDown?.()

        onSwipeEnd?.(direction)
      } else {
        onSwipeEnd?.(null)
      }

      return {
        ...prev,
        isSwiping: false,
      }
    })
  }, [threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onSwipeEnd])

  const swipeHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  }

  return {
    swipeState,
    swipeHandlers,
  }
}

/**
 * Calculate transform value for swipe animation
 */
export function getSwipeTransform(deltaX: number, direction: 'horizontal' | 'vertical' = 'horizontal') {
  if (direction === 'horizontal') {
    return `translateX(${deltaX}px)`
  }
  return `translateY(${deltaX}px)`
}
