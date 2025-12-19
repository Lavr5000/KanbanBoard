import type { ReportData, ReportCheckpoint, Participant } from '@/types';

export class HtmlTemplateBuilder {
  /**
   * Build complete HTML document for PDF
   */
  buildHtml(reportData: ReportData, reportType: 'inspection' | 'complaint'): string {
    const title = reportType === 'inspection' ? 'Акт осмотра' : 'Претензия';

    return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${reportData.projectTitle}</title>
  <style>
    ${this.getCss()}
  </style>
</head>
<body>
  <div class="document">
    ${this.buildHeader(reportData, title)}
    ${this.buildParticipantsTable(reportData.participants)}
    ${this.buildSummary(reportData)}
    ${this.buildViolations(reportData)}
    ${this.buildFooter(reportData)}
  </div>
</body>
</html>
    `;
  }

  private getCss(): string {
    return `
      body {
        font-family: 'Times New Roman', serif;
        font-size: 12pt;
        line-height: 1.5;
        margin: 0;
        padding: 0;
      }
      .document {
        max-width: 210mm;
        margin: 0 auto;
        padding: 20mm;
      }
      h1 {
        text-align: center;
        font-size: 18pt;
        font-weight: bold;
        margin-bottom: 10mm;
      }
      h2 {
        font-size: 14pt;
        font-weight: bold;
        margin-top: 8mm;
        margin-bottom: 4mm;
        border-bottom: 1px solid #333;
        padding-bottom: 2mm;
      }
      .participants-table {
        width: 100%;
        border-collapse: collapse;
        margin: 5mm 0;
      }
      .participants-table th,
      .participants-table td {
        border: 1px solid #333;
        padding: 3mm;
        text-align: left;
      }
      .participants-table th {
        background-color: #f0f0f0;
        font-weight: bold;
      }
      .violation {
        margin: 5mm 0;
        padding: 3mm;
        border-left: 3px solid #d32f2f;
        background-color: #fef5f5;
      }
      .violation-title {
        font-weight: bold;
        font-size: 13pt;
        margin-bottom: 2mm;
      }
      .violation-reference {
        color: #666;
        font-style: italic;
        margin-bottom: 2mm;
      }
      .violation-text {
        margin: 2mm 0;
      }
      .photo-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 3mm;
        margin-top: 3mm;
      }
      .photo {
        max-width: 45%;
        height: auto;
        border: 1px solid #ccc;
      }
      .footer {
        margin-top: 10mm;
        padding-top: 5mm;
        border-top: 1px solid #333;
        font-size: 10pt;
        color: #666;
        text-align: center;
      }
      .summary-table {
        width: 100%;
        border-collapse: collapse;
        margin: 5mm 0;
      }
      .summary-table td {
        padding: 2mm;
        border: 1px solid #ddd;
      }
      .summary-table .label {
        font-weight: bold;
        width: 40%;
        background-color: #f9f9f9;
      }
    `;
  }

  private buildHeader(reportData: ReportData, title: string): string {
    return `
      <h1>${title}</h1>
      <p><strong>Объект:</strong> ${reportData.projectTitle}</p>
      ${reportData.projectAddress ? `<p><strong>Адрес:</strong> ${reportData.projectAddress}</p>` : ''}
      <p><strong>Дата составления:</strong> ${reportData.generatedAt.toLocaleDateString('ru-RU')}</p>
      <p><strong>Режим отделки:</strong> ${reportData.finishMode === 'finish' ? 'Чистовая' : 'Черновая'}</p>
    `;
  }

  private buildParticipantsTable(participants: Participant[]): string {
    if (participants.length === 0) {
      return '<p><em>Участники не указаны</em></p>';
    }

    const roleNames = {
      developer: 'Застройщик',
      representative: 'Представитель',
      inspector: 'Инспектор'
    };

    const rows = participants.map(p => `
      <tr>
        <td>${roleNames[p.role]}</td>
        <td>${p.fullName}</td>
        <td>${p.position}</td>
        <td>${p.organization}</td>
      </tr>
    `).join('');

    return `
      <h2>Участники проверки</h2>
      <table class="participants-table">
        <thead>
          <tr>
            <th>Роль</th>
            <th>ФИО</th>
            <th>Должность</th>
            <th>Организация</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  private buildSummary(reportData: ReportData): string {
    return `
      <h2>Итоги проверки</h2>
      <table class="summary-table">
        <tr>
          <td class="label">Всего проверено:</td>
          <td>${reportData.summary.totalCheckpoints}</td>
        </tr>
        <tr>
          <td class="label">Соответствует требованиям:</td>
          <td>${reportData.summary.totalComplies}</td>
        </tr>
        <tr>
          <td class="label">Выявлено дефектов:</td>
          <td style="color: #d32f2f; font-weight: bold;">${reportData.summary.totalDefects}</td>
        </tr>
        <tr>
          <td class="label">Не проверено:</td>
          <td>${reportData.summary.totalNotInspected}</td>
        </tr>
        <tr>
          <td class="label">Процент выполнения:</td>
          <td><strong>${reportData.summary.overallPercentage}%</strong></td>
        </tr>
      </table>
    `;
  }

  private buildViolations(reportData: ReportData): string {
    const sections = reportData.categories.map(category => {
      const violations = category.checkpoints
        .filter(cp => cp.status === 'defect')
        .map(cp => this.buildViolation(cp))
        .join('');

      if (!violations) return '';

      return `
        <h2>${category.categoryName}</h2>
        ${violations}
      `;
    }).join('');

    return sections || '<p><em>Дефектов не обнаружено</em></p>';
  }

  private buildViolation(checkpoint: ReportCheckpoint): string {
    const photos = checkpoint.photos
      .map(photo => `<img src="${photo.base64}" class="photo" alt="${checkpoint.title}" />`)
      .join('');

    return `
      <div class="violation">
        <div class="violation-title">${checkpoint.title}</div>
        ${checkpoint.standardReference ? `<div class="violation-reference">Норматив: ${checkpoint.standardReference}</div>` : ''}
        ${checkpoint.violation ? `<div class="violation-text">${checkpoint.violation}</div>` : ''}
        ${checkpoint.selectedRoom ? `<div><strong>Помещение:</strong> ${checkpoint.selectedRoom}</div>` : ''}
        ${checkpoint.comment ? `<div><strong>Комментарий:</strong> ${checkpoint.comment}</div>` : ''}
        ${photos ? `<div class="photo-grid">${photos}</div>` : ''}
      </div>
    `;
  }

  private buildFooter(reportData: ReportData): string {
    return `
      <div class="footer">
        <p>Документ создан автоматически с помощью приложения Apartment Auditor</p>
        <p>Дата: ${reportData.generatedAt.toLocaleString('ru-RU')}</p>
      </div>
    `;
  }
}

export const htmlTemplateBuilder = new HtmlTemplateBuilder();