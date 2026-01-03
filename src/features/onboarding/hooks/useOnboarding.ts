'use client'

import { useState, useEffect } from 'react'
import { isOnboardingCompleted, setOnboardingCompleted } from '../lib/storage'

export function useOnboarding() {
  const [shouldRunTour, setShouldRunTour] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if onboarding was completed
    const completed = isOnboardingCompleted()

    // Check screen size (only desktop)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Only run if not completed and on desktop
    if (!completed && !isMobile) {
      setShouldRunTour(true)
    }

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const completeTour = () => {
    setOnboardingCompleted(true)
    setShouldRunTour(false)
  }

  return {
    shouldRunTour,
    setTourCompleted: completeTour,
    isMobile,
  }
}
