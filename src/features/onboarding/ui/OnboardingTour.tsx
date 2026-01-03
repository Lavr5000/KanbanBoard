'use client'

import { useEffect, useRef } from 'react'
import { driver } from 'driver.js'
import type { DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'

const steps: DriveStep[] = [
  {
    element: '[data-tour="roadmap-panel"]',
    popover: {
      title: '🎯 AI Roadmap',
      description: 'Панель внизу экрана для генерации дорожных карт проекта. AI создаст структуру задач на основе твоего описания.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '[data-tour="ai-generate-btn"]',
    popover: {
      title: '✨ Генерация roadmap',
      description: 'Нажми кнопку со звёздочками ✨, чтобы открыть AI чат. Опиши свой проект, и AI предложит список задач.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '[data-tour="add-task-btn"]',
    popover: {
      title: '➕ Новая задача',
      description: 'Создавай задачи в любой колонке. Указывай название и описание задачи.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '[data-tour="task-ai-icon"]',
    popover: {
      title: '🤖 AI в задаче',
      description: 'Иконка со звёздочками ✨ открывает AI предложения. AI улучшит содержание задачи на контексте проекта.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '[data-tour="task-ai-suggestions"]',
    popover: {
      title: '💡 Использование AI',
      description: 'Выбери подходящее предложение из списка. Оно автоматически заменит текст задачи.\n\nГотово! Теперь ты знаешь всё основное. 🎉',
      side: 'top',
      align: 'center',
    },
  },
]

interface OnboardingTourProps {
  run: boolean
  onCallback?: (data: { action: string; step: number }) => void
  onStepChange?: (step: number) => void
  onCloseRoadmap?: () => void
}

export function OnboardingTour({ run, onCallback, onStepChange, onCloseRoadmap }: OnboardingTourProps) {
  const driverObj = useRef<ReturnType<typeof driver> | null>(null)
  const currentStepRef = useRef(0)
  const onCloseRoadmapRef = useRef(onCloseRoadmap)

  // Обновляем ref при изменении onCloseRoadmap
  useEffect(() => {
    onCloseRoadmapRef.current = onCloseRoadmap
  }, [onCloseRoadmap])

  useEffect(() => {
    if (!run) return

    // Сбрасываем счетчик при запуске
    currentStepRef.current = 0

    // Инициализация driver.js
    const driverInstance = driver({
      showProgress: true,
      steps: steps.map((step) => ({
        ...step,
        popover: {
          ...step.popover,
          popoverClass: 'onboarding-driver-popover',
          doneBtnText: 'Завершить',
          nextBtnText: 'Далее',
          prevBtnText: 'Назад',
        },
      })),
      onHighlighted: (element, step, options) => {
        // Используем driverInstance для получения текущего индекса
        const index = driverInstance.getActiveIndex() ?? 0
        currentStepRef.current = index
        // При переходе к шагу 2 (index: 2 - задачи) закрываем roadmap
        if (index === 2) {
          onCloseRoadmapRef.current?.()
        }
      },
      onDestroyed: () => {
        // Сохраняем статус завершения
        onCallback?.({ action: 'destroy', step: currentStepRef.current })
      },
    })

    driverObj.current = driverInstance

    // Запуск тура с задержкой
    const timer = setTimeout(() => {
      driverInstance.drive()
    }, 500)

    return () => {
      clearTimeout(timer)
      driverInstance.destroy()
    }
  }, [run])

  return null
}
