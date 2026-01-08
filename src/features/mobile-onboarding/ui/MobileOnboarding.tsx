'use client';

import { useEffect, useRef } from 'react';
import { driver } from 'driver.js';
import type { DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { mobileOnboardingSteps } from '../lib/mobileSteps';
import { setMobileOnboardingCompleted } from '../lib/mobileStorage';

interface MobileOnboardingProps {
  run: boolean;
  onCallback?: (data: { action: string; step: number }) => void;
}

export function MobileOnboarding({ run, onCallback }: MobileOnboardingProps) {
  const driverObj = useRef<ReturnType<typeof driver> | null>(null);

  useEffect(() => {
    if (!run) return;

    const driverInstance = driver({
      showProgress: true,
      steps: mobileOnboardingSteps.map((step) => ({
        ...step,
        popover: {
          ...step.popover,
          popoverClass: 'mobile-onboarding-driver-popover',
          doneBtnText: 'Готово',
          nextBtnText: 'Далее →',
          prevBtnText: '← Назад',
        },
      })),
      onHighlighted: (element, step, options) => {
        // Scroll element into view for mobile
        if (!element) return;
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
      },
      onNextClick: () => {
        // Save progress
        const activeStep = driverObj.current?.getActiveStep();
        const currentStep = (typeof activeStep === 'number' ? activeStep : 0) || 0;
        onCallback?.({ action: 'next', step: currentStep });
      },
      onPrevClick: () => {
        const activeStep = driverObj.current?.getActiveStep();
        const currentStep = (typeof activeStep === 'number' ? activeStep : 0) || 0;
        onCallback?.({ action: 'prev', step: currentStep });
      },
      onCloseClick: () => {
        setMobileOnboardingCompleted(true);
        onCallback?.({ action: 'close', step: 0 });
      },
      onDestroyed: () => {
        setMobileOnboardingCompleted(true);
        onCallback?.({ action: 'destroy', step: 0 });
      },
    });

    driverObj.current = driverInstance;

    const timer = setTimeout(() => {
      driverInstance.drive();
    }, 500);

    return () => {
      clearTimeout(timer);
      driverInstance.destroy();
    };
  }, [run, onCallback]);

  return null;
}
