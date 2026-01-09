import * as XLSX from 'xlsx';
import { formatTasksForExport, sanitizeFileName } from '../formatters/taskFormatter';
import { ExportParams } from '../../model/types';

export async function exportToExcel({ board, columns, tasks }: ExportParams) {
  try {
    const data = formatTasksForExport(board, columns, tasks);

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Add info sheet with project details
    const infoSheet = XLSX.utils.aoa_to_sheet([
      [`Проект: ${data.board.name}`],
      [`Описание: ${data.board.description || 'Без описания'}`],
      [`Дата экспорта: ${data.board.exportDate}`],
      [''],
      [`Всего колонок: ${data.columns.length}`],
      [`Всего задач: ${tasks.length}`],
    ]);
    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Инфо');

    // Create separate sheet for each column
    data.columns.forEach((column) => {
      if (column.tasks.length === 0) return;

      // Format data for table
      const rows = [
        ['Задача', 'Описание', 'Приоритет', 'Дедлайн'], // Headers
        ...column.tasks.map((task) => [
          task.title,
          task.description,
          task.priority,
          task.deadline,
        ]),
      ];

      const sheet = XLSX.utils.aoa_to_sheet(rows);
      // Limit sheet name to 31 characters (Excel limitation)
      const sheetName = column.title.substring(0, 31);
      XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
    });

    // Generate and download file
    const fileName = `${sanitizeFileName(board.name)}-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    return { success: true };
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return { success: false, error };
  }
}
