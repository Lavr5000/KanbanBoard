import { Task, Column, Board } from '@/lib/supabase/types';

export interface ExportTask {
  title: string;
  description: string | null;
  priority: string;
  deadline: string;
  columnTitle: string;
}

export interface ExportData {
  board: {
    name: string;
    description: string | null;
    exportDate: string;
  };
  columns: Array<{
    title: string;
    tasks: ExportTask[];
  }>;
}

export interface ExportParams {
  board: Board;
  columns: Column[];
  tasks: Task[];
}

export type ExportFormat = 'excel' | 'pdf' | 'json';

export interface ExportButtonProps {
  icon: any;
  label: string;
  description: string;
  onClick: () => void;
  color: 'green' | 'blue' | 'purple';
}

export interface ExportButtonsGroupProps {
  boardId: string | undefined;
  tasks: Task[];
  columns: Column[];
  board?: Board | null;
}

export interface ExportLimitModalProps {
  taskCount: number;
  onExportAll: () => void;
  onExportFirst100: () => void;
  onSelectFormat: (format: ExportFormat) => void;
}
