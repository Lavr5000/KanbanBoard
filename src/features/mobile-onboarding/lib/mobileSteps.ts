import { DriveStep } from 'driver.js';

/**
 * Mobile Onboarding Steps (6 steps)
 * Separate from desktop onboarding - focused on mobile-specific UX
 */
export const mobileOnboardingSteps: DriveStep[] = [
  {
    element: 'body',
    popover: {
      title: '👋 Добро пожаловать в Lavr Kanban!',
      description: 'Давай покажем, как пользоваться мобильной версией. Проведи пальцем влево для продолжения.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-mobile-tour="column-filter"]',
    popover: {
      title: '📋 Фильтр колонок',
      description: 'Свайпай влево/вправо для переключения между колонками. Или тапни на название колонки.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-mobile-tour="task-list"]',
    popover: {
      title: '📝 Все задачи в одном месте',
      description: 'Здесь показаны все задачи выбранной колонки. Скролль вниз для просмотра всех задач.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '[data-mobile-tour="swipe-task"]',
    popover: {
      title: '👆 Перемещение задач свайпом',
      description: 'Свайпни задачу вправо → следующая колонка. Свайп влево → предыдущая. Попробуй!',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '[data-mobile-tour="mobile-ai-tab"]',
    popover: {
      title: '🤖 AI Помощник',
      description: 'Открой вкладку AI внизу для генерации roadmap проекта с помощью искусственного интеллекта.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '[data-mobile-tour="add-task-mobile"]',
    popover: {
      title: '➕ Создание задач',
      description: 'Нажми кнопку + для создания новой задачи. Готово! 🎉',
      side: 'top',
      align: 'center',
    },
  },
];
