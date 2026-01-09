'use client';

import { FileSpreadsheet, FileText, Database, X } from 'lucide-react';
import { ExportFormat } from '../model/types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => void;
}

export function ExportModal({ isOpen, onClose, onExport }: ExportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-[#1a1a20] rounded-xl border border-gray-800 max-w-md w-full p-6 animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Экспортировать данные</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Format options */}
        <div className="space-y-2">
          <button
            onClick={() => onExport('excel')}
            className="w-full p-3 rounded-lg border border-gray-800 hover:border-green-500/30 hover:bg-green-500/10 transition-all group"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={20} className="text-green-500" />
              <div className="flex-1 text-left">
                <p className="text-white text-sm font-medium">Excel (.xlsx)</p>
                <p className="text-gray-500 text-xs">Для редактирования в таблицах</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onExport('pdf')}
            className="w-full p-3 rounded-lg border border-gray-800 hover:border-blue-500/30 hover:bg-blue-500/10 transition-all group"
          >
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-blue-500" />
              <div className="flex-1 text-left">
                <p className="text-white text-sm font-medium">PDF (.pdf)</p>
                <p className="text-gray-500 text-xs">Для печати</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onExport('json')}
            className="w-full p-3 rounded-lg border border-gray-800 hover:border-purple-500/30 hover:bg-purple-500/10 transition-all group"
          >
            <div className="flex items-center gap-3">
              <Database size={20} className="text-purple-500" />
              <div className="flex-1 text-left">
                <p className="text-white text-sm font-medium">JSON (.json)</p>
                <p className="text-gray-500 text-xs">Полный бэкап данных</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
