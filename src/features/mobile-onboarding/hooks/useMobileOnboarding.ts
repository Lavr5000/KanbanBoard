'use client';

import { useState, useEffect } from 'react';
import {
  isMobileOnboardingCompleted,
  setMobileOnboardingCompleted,
} from '../lib/mobileStorage';
import { useIsMobile } from '@/shared/lib/useMediaQuery';

export function useMobileOnboarding() {
  const [shouldRunMobileTour, setShouldRunMobileTour] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Only run on mobile devices
    if (!isMobile) {
      setShouldRunMobileTour(false);
      return;
    }

    const completed = isMobileOnboardingCompleted();

    if (!completed) {
      // Delay to avoid showing on first render
      const timer = setTimeout(() => {
        setShouldRunMobileTour(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  const completeTour = () => {
    setMobileOnboardingCompleted(true);
    setShouldRunMobileTour(false);
  };

  return {
    shouldRunMobileTour,
    setMobileTourCompleted: completeTour,
    isMobile,
  };
}
