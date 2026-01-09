import { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Database,
  AlertTriangle,
  X,
} from 'lucide-react';
import { ExportLimitModalProps, ExportFormat } from '../model/types';

export function ExportLimitModal({
  taskCount,
  onExportAll,
  onExportFirst100,
  onSelectFormat,
}: ExportLimitModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);

  const handleExport = (type: 'all' | 'first100') => {
    if (!selectedFormat) return;

    onSelectFormat(selectedFormat);

    if (type === 'all') {
      onExportAll();
    } else {
      onExportFirst100();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-[#1a1a20] rounded-xl border border-gray-800 max-w-md w-full p-6 animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Экспорт данных</h2>
          <button
            onClick={() => onSelectFormat('excel' as ExportFormat)}
            className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg mb-4">
          <AlertTriangle size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-sm font-medium mb-1">Большой объём данных</p>
            <p className="text-gray-400 text-xs">
              На доске{' '}
              <span className="text-orange-400 font-semibold">{taskCount} задач</span>
              . Экспорт может занять время.
            </p>
          </div>
        </div>

        {/* Format selection */}
        <div className="space-y-2 mb-4">
          <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">
            Выберите формат:
          </p>

          <button
            onClick={() => setSelectedFormat('excel')}
            className={`w-full p-3 rounded-lg border transition-all ${
              selectedFormat === 'excel'
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-[#1a1a20] border-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={18} className="text-green-500" />
              <div className="text-left">
                <p className="text-white text-sm font-medium">Excel</p>
                <p className="text-gray-500 text-xs">Для редактирования</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedFormat('pdf')}
            className={`w-full p-3 rounded-lg border transition-all ${
              selectedFormat === 'pdf'
                ? 'bg-blue-500/10 border-blue-500/30'
                : 'bg-[#1a1a20] border-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-blue-500" />
              <div className="text-left">
                <p className="text-white text-sm font-medium">PDF</p>
                <p className="text-gray-500 text-xs">Для печати</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedFormat('json')}
            className={`w-full p-3 rounded-lg border transition-all ${
              selectedFormat === 'json'
                ? 'bg-purple-500/10 border-purple-500/30'
                : 'bg-[#1a1a20] border-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <Database size={18} className="text-purple-500" />
              <div className="text-left">
                <p className="text-white text-sm font-medium">JSON</p>
                <p className="text-gray-500 text-xs">Полный бэкап</p>
              </div>
            </div>
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => handleExport('first100')}
            disabled={!selectedFormat}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm font-medium rounded-lg transition-all"
          >
            Первые 100 задач
          </button>
          <button
            onClick={() => handleExport('all')}
            disabled={!selectedFormat}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm font-medium rounded-lg transition-all"
          >
            Все задачи ({taskCount})
          </button>
        </div>
      </div>
    </div>
  );
}
