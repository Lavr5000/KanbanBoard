import { formatTasksForExport, sanitizeFileName } from '../formatters/taskFormatter';
import { ExportParams } from '../../model/types';

export async function exportToJSON({ board, columns, tasks }: ExportParams) {
  try {
    const data = formatTasksForExport(board, columns, tasks);

    const exportData = {
      ...data,
      meta: {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        totalTasks: tasks.length,
        totalColumns: columns.length,
      },
    };

    const fileData = JSON.stringify(exportData, null, 2);
    const blob = new Blob([fileData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sanitizeFileName(board.name)}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    return { success: false, error };
  }
}
