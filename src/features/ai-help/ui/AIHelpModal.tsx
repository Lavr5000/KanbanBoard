'use client';

import { X, Sparkles, Map, Plus } from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';

interface AIHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIHelpModal({ isOpen, onClose }: AIHelpModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🤖 Как работает AI">
      <div className="space-y-6 text-gray-300">
        {/* Section 1: AI Roadmap */}
        <div className="bg-gradient-to-br from-purple-600/10 to-indigo-600/10 rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg shadow-lg flex-shrink-0">
              <Map size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">AI Roadmap</h3>
              <p className="text-sm text-gray-400">
                Генерация дорожной карты проекта с помощью AI
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">1.</span>
              <span>Нажми кнопку <strong className="text-white">✨ AI</strong> в правом нижнем углу (на десктопе) или внизу экрана (на мобильном)</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">2.</span>
              <span>Опиши свою идею проекта в чате с AI</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">3.</span>
              <span>AI предложит структурированную дорожную карту с этапами и задачами</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">4.</span>
              <span>Утверди вариант и создай первые 5 задач одним нажатием</span>
            </p>
          </div>
        </div>

        {/* Section 2: AI в задачах */}
        <div className="bg-gradient-to-br from-indigo-600/10 to-purple-600/10 rounded-xl p-4 border border-indigo-500/20">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg shadow-lg flex-shrink-0">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">AI в задачах</h3>
              <p className="text-sm text-gray-400">
                Улучшение содержания задач с помощью AI
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p className="flex items-start gap-2">
              <span className="text-indigo-400 mt-1">1.</span>
              <span>Наведи на задачу и нажми кнопку <strong className="text-white">✨</strong> (появляется при наведении на десктопе, всегда видна на мобильном)</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-indigo-400 mt-1">2.</span>
              <span>AI проанализирует контекст проекта и предложит улучшения</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-indigo-400 mt-1">3.</span>
              <span>Выбери подходящее предложение из списка (улучшенный заголовок, описание, критерии приёма)</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-indigo-400 mt-1">4.</span>
              <span>Предложение автоматически применится к задаче</span>
            </p>
          </div>
        </div>

        {/* Tip */}
        <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20 text-sm">
          <p className="flex items-start gap-2">
            <span className="text-blue-400 text-lg">💡</span>
            <span>
              <strong className="text-white">Совет:</strong> AI предложения сохраняются автоматически.
              Можно вернуться к ним в любое время, нажав на иконку <strong className="text-white">✨ AI</strong>
            </span>
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg font-medium text-white transition-colors"
        >
          Понятно! 🎉
        </button>
      </div>
    </Modal>
  );
}
