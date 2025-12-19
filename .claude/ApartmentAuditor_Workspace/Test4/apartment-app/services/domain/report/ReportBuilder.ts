import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { Project, DBCheckpoint, ReportData, PhotoProcessProgress } from '@/types';
import { photoProcessor } from '@/services/data/pdf/PhotoProcessor';
import { reportDataMapper } from './ReportDataMapper';
import { htmlTemplateBuilder } from './HtmlTemplateBuilder';

export interface ReportGenerationProgress {
  stage: 'preparing' | 'processing_photos' | 'building_html' | 'generating_pdf' | 'complete';
  message: string;
  percentage: number;
  photoProgress?: PhotoProcessProgress;
}

export class ReportBuilder {
  /**
   * Generate and share PDF report
   */
  async generateReport(
    project: Project,
    allCheckpoints: DBCheckpoint[], // Already merged from checkpointStore
    reportType: 'inspection' | 'complaint',
    onProgress?: (progress: ReportGenerationProgress) => void
  ): Promise<string> {
    try {
      // Stage 1: Prepare data
      onProgress?.({
        stage: 'preparing',
        message: 'Подготовка данных...',
        percentage: 10
      });

      // Validate participants
      if (!project.participants || project.participants.length === 0) {
        throw new Error('Добавьте участников проверки перед экспортом');
      }

      // Build report data structure
      const reportData = reportDataMapper.buildReportData(
        project,
        allCheckpoints,
        reportType
      );

      // Stage 2: Process photos
      onProgress?.({
        stage: 'processing_photos',
        message: 'Обработка фотографий...',
        percentage: 20
      });

      // Collect all photo URIs from checkpoints
      const allPhotoUris: string[] = [];
      reportData.categories.forEach(category => {
        category.checkpoints.forEach(checkpoint => {
          const dbCheckpoint = allCheckpoints.find(cp => cp.id === checkpoint.id);
          if (dbCheckpoint?.userPhotos) {
            allPhotoUris.push(...dbCheckpoint.userPhotos);
          }
        });
      });

      // Process photos in batches
      const processedPhotos = await photoProcessor.processPhotosInBatches(
        allPhotoUris,
        (photoProgress) => {
          onProgress?.({
            stage: 'processing_photos',
            message: `Обработка фото ${photoProgress.current}/${photoProgress.total}...`,
            percentage: 20 + (photoProgress.percentage * 0.5), // 20-70%
            photoProgress
          });
        }
      );

      // Map processed photos back to checkpoints
      let photoIndex = 0;
      reportData.categories.forEach(category => {
        category.checkpoints.forEach(checkpoint => {
          const dbCheckpoint = allCheckpoints.find(cp => cp.id === checkpoint.id);
          const photoCount = dbCheckpoint?.userPhotos?.length || 0;
          checkpoint.photos = processedPhotos.slice(photoIndex, photoIndex + photoCount);
          photoIndex += photoCount;
        });
      });

      // Stage 3: Build HTML
      onProgress?.({
        stage: 'building_html',
        message: 'Создание документа...',
        percentage: 75
      });

      const html = htmlTemplateBuilder.buildHtml(reportData, reportType);

      // Stage 4: Generate PDF
      onProgress?.({
        stage: 'generating_pdf',
        message: 'Генерация PDF...',
        percentage: 85
      });

      const { uri } = await Print.printToFileAsync({ html });

      // Stage 5: Share
      onProgress?.({
        stage: 'complete',
        message: 'Готово!',
        percentage: 100
      });

      // Open share dialog
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }

      return uri;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      console.error('PDF Generation Failed:', {
        projectId: project.id,
        error: errorMessage,
        stack: errorStack
      });

      // Re-throw with user-friendly message
      if (errorMessage.includes('participants')) {
        throw new Error('Добавьте участников проверки перед экспортом');
      }

      if (errorMessage.includes('Photo') || errorMessage.includes('photo')) {
        throw new Error('Ошибка обработки фотографий. Проверьте доступ к файлам.');
      }

      throw new Error(`Не удалось создать PDF: ${errorMessage}`);
    }
  }
}

export const reportBuilder = new ReportBuilder();