import { AlertCircle } from 'lucide-react';

export function EmptyStateMessage() {
  return (
    <div className="p-4 bg-[#1a1a20] border border-gray-800 rounded-lg">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-yellow-500/10 rounded-lg">
          <AlertCircle size={16} className="text-yellow-500" />
        </div>
        <div>
          <p className="text-white text-sm font-medium mb-1">Нет задач для экспорта</p>
          <p className="text-gray-500 text-xs leading-relaxed">
            На этой доске пока нет задач. Создайте первую задачу и возвращайтесь! 🎯
          </p>
        </div>
      </div>
    </div>
  );
}
