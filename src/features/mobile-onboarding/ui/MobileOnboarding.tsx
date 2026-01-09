'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Map,
  Plus,
  Wand2,
  GripVertical,
  CheckCircle2
} from 'lucide-react'
import { useMobileUIStore, isMobileOnboardingCompleted } from '@/entities/ui/model/mobileStore'
import { useSwipe } from '@/hooks/useSwipe'
import { hapticFeedback, lockBodyScroll, unlockBodyScroll } from '@/shared/lib/mobile'

interface OnboardingStep {
  title: string
  description: string
  icon: React.ReactNode
  gradient: string
  demo?: React.ReactNode
}

const steps: OnboardingStep[] = [
  {
    title: 'Добро пожаловать!',
    description: 'Это ваша персональная Kanban доска с AI помощником. Swipe вправо, чтобы узнать больше.',
    icon: <Sparkles size={48} className="text-purple-400" />,
    gradient: 'from-purple-600 to-indigo-600',
  },
  {
    title: 'Создайте задачу',
    description: 'Нажмите + внизу экрана, чтобы добавить новую задачу. AI автоматически улучшит её описание.',
    icon: <Plus size={48} className="text-blue-400" />,
    gradient: 'from-blue-600 to-cyan-600',
    demo: (
      <div className="mt-4 flex justify-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/40 animate-pulse">
          <Plus size={32} className="text-white" />
        </div>
      </div>
    ),
  },
  {
    title: 'Дорожная карта',
    description: 'Свайпните влево или нажмите на иконку карты, чтобы открыть Roadmap проекта.',
    icon: <Map size={48} className="text-emerald-400" />,
    gradient: 'from-emerald-600 to-green-600',
    demo: (
      <div className="mt-4 flex justify-center gap-2">
        <div className="px-4 py-2 bg-[#1c1c24] rounded-xl border border-emerald-500/30 text-emerald-400 text-sm">
          ← Свайп влево
        </div>
      </div>
    ),
  },
  {
    title: 'AI Генерация',
    description: 'Используйте AI для генерации дорожной карты или улучшения задач. Просто опишите проект!',
    icon: <Wand2 size={48} className="text-pink-400" />,
    gradient: 'from-pink-600 to-purple-600',
    demo: (
      <div className="mt-4 flex justify-center">
        <div className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white font-medium shadow-lg shadow-purple-500/40 flex items-center gap-2">
          <Sparkles size={20} />
          Сгенерировать AI
        </div>
      </div>
    ),
  },
  {
    title: 'Перетаскивание',
    description: 'Зажмите задачу и перетащите её в нужную колонку. Свайпайте между колонками.',
    icon: <GripVertical size={48} className="text-orange-400" />,
    gradient: 'from-orange-600 to-red-600',
    demo: (
      <div className="mt-4 flex justify-center gap-4">
        <div className="flex flex-col gap-2 items-center">
          <div className="w-20 h-16 bg-[#1c1c24] rounded-xl border border-gray-700 flex items-center justify-center text-xs text-gray-500">
            Задача
          </div>
          <span className="text-xs text-gray-500">Зажать</span>
        </div>
        <ChevronRight size={24} className="text-gray-600 self-center" />
        <div className="flex flex-col gap-2 items-center">
          <div className="w-20 h-16 bg-[#1c1c24] rounded-xl border border-blue-500/50 flex items-center justify-center text-xs text-blue-400">
            Готово
          </div>
          <span className="text-xs text-gray-500">Отпустить</span>
        </div>
      </div>
    ),
  },
  {
    title: 'Всё готово!',
    description: 'Теперь вы знаете основы. Начните создавать проект мечты с помощью AI!',
    icon: <CheckCircle2 size={48} className="text-green-400" />,
    gradient: 'from-green-600 to-emerald-600',
  },
]

export function MobileOnboarding() {
  const {
    isMobileOnboardingActive,
    mobileOnboardingStep,
    nextOnboardingStep,
    prevOnboardingStep,
    completeMobileOnboarding,
    skipMobileOnboarding,
    startMobileOnboarding,
  } = useMobileUIStore()

  const [mounted, setMounted] = useState(false)

  // Check if should show onboarding
  useEffect(() => {
    setMounted(true)
    if (!isMobileOnboardingCompleted()) {
      // Delay start for smoother UX
      const timer = setTimeout(() => startMobileOnboarding(), 1000)
      return () => clearTimeout(timer)
    }
  }, [startMobileOnboarding])

  // Swipe navigation
  const { swipeHandlers } = useSwipe({
    threshold: 50,
    onSwipeLeft: () => {
      if (mobileOnboardingStep < steps.length - 1) {
        hapticFeedback('light')
        nextOnboardingStep()
      }
    },
    onSwipeRight: () => {
      if (mobileOnboardingStep > 0) {
        hapticFeedback('light')
        prevOnboardingStep()
      }
    },
  })

  // Lock body scroll
  useEffect(() => {
    if (isMobileOnboardingActive) {
      lockBodyScroll()
    } else {
      unlockBodyScroll()
    }
    return () => unlockBodyScroll()
  }, [isMobileOnboardingActive])

  const handleNext = () => {
    hapticFeedback('light')
    if (mobileOnboardingStep === steps.length - 1) {
      completeMobileOnboarding()
    } else {
      nextOnboardingStep()
    }
  }

  const handleSkip = () => {
    hapticFeedback('light')
    skipMobileOnboarding()
  }

  if (!mounted || !isMobileOnboardingActive) return null

  const currentStep = steps[mobileOnboardingStep]
  const isLastStep = mobileOnboardingStep === steps.length - 1

  const content = (
    <div
      className="fixed inset-0 z-[200] bg-[#121218] flex flex-col"
      {...swipeHandlers}
    >
      {/* Safe area padding */}
      <div className="h-full flex flex-col pt-safe-top pb-safe-bottom">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === mobileOnboardingStep
                    ? 'w-6 bg-white'
                    : index < mobileOnboardingStep
                    ? 'w-2 bg-white/50'
                    : 'w-2 bg-gray-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleSkip}
            className="text-gray-500 text-sm hover:text-white transition-colors px-3 py-1"
          >
            Пропустить
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          {/* Icon with gradient background */}
          <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${currentStep.gradient} flex items-center justify-center mb-8 shadow-2xl animate-float`}>
            {currentStep.icon}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-4">
            {currentStep.title}
          </h2>

          {/* Description */}
          <p className="text-gray-400 text-lg leading-relaxed max-w-xs">
            {currentStep.description}
          </p>

          {/* Demo */}
          {currentStep.demo}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 space-y-3">
          {/* Next Button */}
          <button
            onClick={handleNext}
            className={`w-full py-4 rounded-2xl font-medium text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] bg-gradient-to-r ${currentStep.gradient} text-white shadow-lg`}
          >
            {isLastStep ? 'Начать' : 'Далее'}
            {!isLastStep && <ChevronRight size={20} />}
          </button>

          {/* Navigation hint */}
          <p className="text-center text-gray-600 text-sm">
            Свайпайте влево/вправо для навигации
          </p>
        </div>

      </div>
    </div>
  )

  return createPortal(content, document.body)
}
