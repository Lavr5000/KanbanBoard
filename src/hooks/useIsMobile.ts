'use client'

import { useState, useEffect } from 'react'

/**
 * Hook to detect mobile device
 * Uses both screen width and touch capability for accurate detection
 */
export function useIsMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      // Check screen width
      const isSmallScreen = window.innerWidth < breakpoint

      // Check if device supports touch
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

      // Consider mobile if screen is small OR (touch device with medium screen)
      setIsMobile(isSmallScreen || (isTouchDevice && window.innerWidth < 1024))
    }

    // Initial check
    checkMobile()

    // Listen for resize
    window.addEventListener('resize', checkMobile)

    // Listen for orientation change on mobile
    window.addEventListener('orientationchange', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('orientationchange', checkMobile)
    }
  }, [breakpoint])

  return isMobile
}

/**
 * Hook to get current breakpoint
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>('xl')

  useEffect(() => {
    const getBreakpoint = () => {
      const width = window.innerWidth
      if (width < 480) return 'xs'
      if (width < 640) return 'sm'
      if (width < 768) return 'md'
      if (width < 1024) return 'lg'
      if (width < 1280) return 'xl'
      return '2xl'
    }

    const handleResize = () => {
      setBreakpoint(getBreakpoint())
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return breakpoint
}
