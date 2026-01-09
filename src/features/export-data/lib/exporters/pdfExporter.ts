import { formatTasksForExport, sanitizeFileName } from '../formatters/taskFormatter';
import { ExportParams } from '../../model/types';

export async function exportToPDF({ board, columns, tasks }: ExportParams) {
  try {
    // Dynamic import to avoid SSR issues with html2pdf.js
    const html2pdf = (await import('html2pdf.js')).default;

    const data = formatTasksForExport(board, columns, tasks);

    // Create HTML content with styling
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            color: #333;
            background: #fff;
            padding: 20px;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          .header {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            padding: 20px;
            margin: -20px -20px 20px -20px;
            border-radius: 8px 8px 0 0;
          }

          .header h1 {
            font-size: 24px;
            margin-bottom: 5px;
          }

          .header .subtitle {
            font-size: 11px;
            opacity: 0.9;
          }

          .section {
            margin-bottom: 20px;
          }

          .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #1a1a20;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 2px solid #6366f1;
          }

          .info-grid {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 8px 15px;
            margin-bottom: 15px;
          }

          .info-label {
            font-weight: bold;
            color: #666;
          }

          .info-value {
            color: #333;
          }

          .column {
            margin-bottom: 20px;
            page-break-inside: avoid;
          }

          .column-header {
            background: #252530;
            color: #a1a1aa;
            padding: 10px;
            font-size: 13px;
            font-weight: bold;
            border-radius: 4px;
            margin-bottom: 10px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 12px;
          }

          thead {
            background: #1a1a20;
            color: white;
          }

          th {
            padding: 10px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
          }

          td {
            padding: 8px;
            border-bottom: 1px solid #e5e7eb;
          }

          tr:nth-child(even) {
            background: #f9fafb;
          }

          .priority-high {
            color: #ef4444;
            font-weight: bold;
          }

          .priority-medium {
            color: #f59e0b;
            font-weight: bold;
          }

          .priority-low {
            color: #22c55e;
            font-weight: bold;
          }

          .task-number {
            color: #6366f1;
            font-weight: bold;
          }

          .footer {
            text-align: center;
            color: #737373;
            font-size: 9px;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
          }

          @media print {
            body {
              padding: 0;
            }

            .column {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Lavr Kanban AI</h1>
          <div class="subtitle">Экспорт: ${data.board.exportDate}</div>
        </div>

        <div class="section">
          <div class="section-title">Информация о проекте</div>
          <div class="info-grid">
            <div class="info-label">Название:</div>
            <div class="info-value">${data.board.name}</div>

            <div class="info-label">Описание:</div>
            <div class="info-value">${data.board.description || 'Нет описания'}</div>

            <div class="info-label">Дата экспорта:</div>
            <div class="info-value">${data.board.exportDate}</div>

            <div class="info-label">Всего задач:</div>
            <div class="info-value">${tasks.length}</div>

            <div class="info-label">Всего колонок:</div>
            <div class="info-value">${columns.length}</div>
          </div>
        </div>

        ${data.columns.map((column, colIndex) => `
          <div class="column">
            <div class="column-header">
              Колонка: ${column.title} (${column.tasks.length} задач)
            </div>

            ${column.tasks.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th style="width: 8%">#</th>
                    <th style="width: 30%">Задача</th>
                    <th style="width: 35%">Описание</th>
                    <th style="width: 12%">Приоритет</th>
                    <th style="width: 15%">Дедлайн</th>
                  </tr>
                </thead>
                <tbody>
                  ${column.tasks.map((task, taskIndex) => `
                    <tr>
                      <td class="task-number">${colIndex + 1}.${taskIndex + 1}</td>
                      <td><strong>${task.title}</strong></td>
                      <td>${task.description || '—'}</td>
                      <td class="priority-${task.priority === 'Высокий' ? 'high' : task.priority === 'Средний' ? 'medium' : 'low'}">${task.priority}</td>
                      <td>${task.deadline}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p style="color: #999; padding: 10px;">Нет задач в этой колонке</p>'}
          </div>
        `).join('')}

        <div class="footer">
          Сгенерировано с помощью Lavr Kanban AI • ${data.board.exportDate}
        </div>
      </body>
      </html>
    `;

    // Configure html2pdf options for high quality
    const opt = {
      margin: 0, // Remove margins to prevent blank first page
      filename: `${sanitizeFileName(board.name)}-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg' as const, quality: 1 },
      html2canvas: {
        scale: 4, // High resolution for print quality
        useCORS: true,
        letterRendering: true,
        logging: false,
        dpi: 300, // Print quality DPI
      },
      jsPDF: {
        unit: 'mm' as const,
        format: 'a4' as const,
        orientation: 'portrait' as const,
        compress: false, // Better quality
      },
      pagebreak: { mode: 'css' as const, avoid: '.column' }, // Better page break handling
    };

    // Generate and download PDF
    await html2pdf().set(opt).from(htmlContent).save();

    return { success: true };
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return { success: false, error };
  }
}
