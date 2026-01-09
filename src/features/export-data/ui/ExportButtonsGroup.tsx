'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { ExportButtonsGroupProps, ExportFormat } from '../model/types';
import { exportToExcel } from '../lib/exporters/excelExporter';
import { exportToPDF } from '../lib/exporters/pdfExporter';
import { exportToJSON } from '../lib/exporters/jsonExporter';
import { showEmptyState, exceedsLimit } from '../lib/validators';
import { EmptyStateMessage } from './EmptyStateMessage';
import { ExportLimitModal } from './ExportLimitModal';
import { ExportModal } from './ExportModal';

export function ExportButtonsGroup({
  boardId,
  tasks,
  columns,
  board,
}: ExportButtonsGroupProps) {
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);

  // Check for empty data
  if (showEmptyState(tasks)) {
    return <EmptyStateMessage />;
  }

  // Check for limit > 100
  if (exceedsLimit(tasks, 100) && !showLimitModal) {
    return (
      <ExportLimitModal
        taskCount={tasks?.length || 0}
        onExportAll={() => {
          setShowLimitModal(false);
          handleExport(selectedFormat!);
        }}
        onExportFirst100={() => {
          const first100 = tasks!.slice(0, 100);
          setShowLimitModal(false);
          handleExport(selectedFormat!, first100);
        }}
        onSelectFormat={(format) => {
          setSelectedFormat(format);
          setShowLimitModal(true);
        }}
      />
    );
  }

  const handleExport = async (format: ExportFormat, tasksData = tasks) => {
    console.log('Export called:', { format, board, boardId, tasks, columns });

    if (!board || !boardId) {
      console.error('No board selected:', { board, boardId });
      alert('Сначала выберите проект');
      return;
    }

    if (!tasks || tasks.length === 0) {
      console.error('No tasks to export');
      alert('Нет задач для экспорта');
      return;
    }

    if (!columns || columns.length === 0) {
      console.error('No columns');
      alert('Нет колонок');
      return;
    }

    try {
      console.log('Starting export to', format);
      let result;
      switch (format) {
        case 'excel':
          result = await exportToExcel({ board, columns, tasks: tasksData });
          break;
        case 'pdf':
          result = await exportToPDF({ board, columns, tasks: tasksData });
          break;
        case 'json':
          result = await exportToJSON({ board, columns, tasks: tasksData });
          break;
      }
      console.log('Export result:', result);
      setShowExportModal(false);
    } catch (error) {
      console.error('Export error:', error);
      alert('Ошибка экспорта: ' + (error as Error).message);
    }
  };

  const handleExportClick = () => {
    if (exceedsLimit(tasks, 100)) {
      setShowLimitModal(true);
    } else {
      setShowExportModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleExportClick}
        className="w-full flex items-center gap-3 px-4 py-3 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
      >
        <Download size={14} />
        <span className="flex-1 text-left">Экспортировать данные</span>
      </button>

      {/* Export format modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />

      {/* Limit modal */}
      {showLimitModal && (
        <ExportLimitModal
          taskCount={tasks?.length || 0}
          onExportAll={() => {
            setShowLimitModal(false);
            handleExport(selectedFormat!);
          }}
          onExportFirst100={() => {
            const first100 = tasks!.slice(0, 100);
            setShowLimitModal(false);
            handleExport(selectedFormat!, first100);
          }}
          onSelectFormat={(format) => {
            setSelectedFormat(format);
          }}
        />
      )}
    </>
  );
}
