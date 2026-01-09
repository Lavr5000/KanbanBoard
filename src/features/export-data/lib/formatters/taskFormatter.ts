import { ExportData, ExportTask } from '../../model/types';
import { Task, Column, Board } from '@/lib/supabase/types';

export function formatTasksForExport(
  board: Board,
  columns: Column[],
  tasks: Task[]
): ExportData {
  // Group tasks by columns
  const columnsWithTasks = columns.map((column) => ({
    title: column.title,
    tasks: tasks
      .filter((task) => task.column_id === column.id)
      .map((task) => ({
        title: task.title,
        description: task.description || '',
        priority: translatePriority(task.priority),
        deadline: task.deadline
          ? new Date(task.deadline).toLocaleDateString('ru-RU')
          : 'Не указан',
        columnTitle: column.title,
      })),
  }));

  return {
    board: {
      name: board.name,
      description: board.description,
      exportDate: new Date().toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    },
    columns: columnsWithTasks,
  };
}

function translatePriority(priority: string): string {
  const map: Record<string, string> = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
  };
  return map[priority] || priority;
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, '_').substring(0, 100);
}
