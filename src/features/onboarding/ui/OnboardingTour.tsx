'use client'

import Joyride, { CallBackProps, STATUS } from 'react-joyride'
import { tourSteps } from '../lib/tour-steps'
import { joyrideStyles } from '../lib/joyride-styles'

interface OnboardingTourProps {
  run: boolean
  onCallback?: (data: CallBackProps) => void
}

export function OnboardingTour({ run, onCallback }: OnboardingTourProps) {
  const handleCallback = (data: CallBackProps) => {
    const { status } = data

    // Save progress on each step
    if (data.action === 'next' || data.action === 'prev') {
      const stepIndex = data.index + (data.action === 'next' ? 1 : -1)
      // Optional: save progress to localStorage
      // saveOnboardingProgress(stepIndex)
    }

    // Call parent callback
    onCallback?.(data)
  }

  return (
    <Joyride
      steps={tourSteps}
      run={run}
      continuous
      showSkipButton
      showProgress
      scrollToFirstStep
      styles={joyrideStyles}
      callback={handleCallback}
      locale={{
        back: 'Назад',
        close: 'Закрыть',
        last: 'Завершить',
        next: 'Далее',
        open: 'Открыть',
        skip: 'Пропустить тур',
      }}
    />
  )
}
