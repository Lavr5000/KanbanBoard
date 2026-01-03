import { Step } from 'react-joyride'

export const tourSteps: Step[] = [
  {
    target: '[data-tour="roadmap-panel"]',
    content: (
      <div className="onboarding-content">
        <h3 className="text-lg font-semibold text-white mb-2">🎯 AI Roadmap</h3>
        <p className="text-gray-300 text-sm mb-2">
          Панель внизу экрана для генерации дорожных карт проекта.
        </p>
        <p className="text-gray-400 text-xs">
          AI создаст структуру задач на основе твоего описания.
        </p>
      </div>
    ),
    disableBeacon: true,
    placement: 'top',
  },
  {
    target: '[data-tour="ai-generate-btn"]',
    content: (
      <div className="onboarding-content">
        <h3 className="text-lg font-semibold text-white mb-2">✨ Генерация roadmap</h3>
        <p className="text-gray-300 text-sm mb-2">
          Нажми кнопку с Sparkles, чтобы открыть AI чат.
        </p>
        <p className="text-gray-400 text-xs">
          Опиши свой проект, и AI предложит список задач.
        </p>
      </div>
    ),
    placement: 'left',
  },
  {
    target: '[data-tour="add-column-btn"]',
    content: (
      <div className="onboarding-content">
        <h3 className="text-lg font-semibold text-white mb-2">📋 Создание колонок</h3>
        <p className="text-gray-300 text-sm mb-2">
          Нажми &quot;+&quot; чтобы добавить новую колонку на доску.
        </p>
        <p className="text-gray-400 text-xs">
          Максимум 7 колонок. Первую удалить нельзя.
        </p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="add-task-btn"]',
    content: (
      <div className="onboarding-content">
        <h3 className="text-lg font-semibold text-white mb-2">➕ Новая задача</h3>
        <p className="text-gray-300 text-sm mb-2">
          Создавай задачи в любой колонке.
        </p>
        <p className="text-gray-400 text-xs">
          Указывай приоритет, теги и сроки.
        </p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '[data-tour="task-ai-icon"]',
    content: (
      <div className="onboarding-content">
        <h3 className="text-lg font-semibold text-white mb-2">🤖 AI в задаче</h3>
        <p className="text-gray-300 text-sm mb-2">
          Иконка sparkles открывает AI предложения.
        </p>
        <p className="text-gray-400 text-xs">
          AI улучшит содержание задачи на контексте проекта.
        </p>
      </div>
    ),
    placement: 'left',
  },
  {
    target: '[data-tour="task-ai-suggestions"]',
    content: (
      <div className="onboarding-content">
        <h3 className="text-lg font-semibold text-white mb-2">💡 Использование AI</h3>
        <p className="text-gray-300 text-sm mb-2">
          Выбери подходящее предложение из списка.
        </p>
        <p className="text-gray-400 text-xs mb-2">
          Оно автоматически заменит текст задачи.
        </p>
        <p className="text-blue-400 text-sm font-medium">
          Готово! Теперь ты знаешь всё основное. 🎉
        </p>
      </div>
    ),
    placement: 'top',
  },
]
