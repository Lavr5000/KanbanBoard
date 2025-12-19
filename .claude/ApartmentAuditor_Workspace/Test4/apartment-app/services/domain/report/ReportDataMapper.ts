import type {
  ReportData,
  ReportCheckpoint,
  Project,
  DBCheckpoint,
  FinishMode,
  CheckpointStatus
} from '@/types';
import { reportStatistics } from './ReportStatistics';
import checkpointsDB from '@/constants/checkpoints_v2.1.json';

export class ReportDataMapper {
  /**
   * Build complete report data from project and checkpoint store
   */
  buildReportData(
    project: Project,
    allCheckpoints: DBCheckpoint[], // Already merged with user changes
    reportType: 'inspection' | 'complaint'
  ): ReportData {
    // Filter checkpoints by type
    const filteredCheckpoints = reportType === 'complaint'
      ? allCheckpoints.filter(cp => cp.status === 'defect')
      : allCheckpoints.filter(cp => cp.status && cp.status !== 'not_inspected');

    // Group by category
    const categoriesMap = new Map<string, ReportCheckpoint[]>();

    filteredCheckpoints.forEach(checkpoint => {
      const categoryId = checkpoint.categoryId;
      if (!categoriesMap.has(categoryId)) {
        categoriesMap.set(categoryId, []);
      }

      categoriesMap.get(categoryId)!.push({
        id: checkpoint.id,
        categoryName: checkpointsDB.categories[categoryId as keyof typeof checkpointsDB.categories].name,
        title: checkpoint.title,
        status: checkpoint.status!,
        violation: checkpoint.violationText,
        standardReference: checkpoint.standardReference,
        photos: [], // Will be filled by PhotoProcessor
        comment: checkpoint.userComment,
        selectedRoom: checkpoint.selectedRoom
      });
    });

    // Build category data with stats
    const categories = Array.from(categoriesMap.entries()).map(([categoryId, checkpoints]) => ({
      categoryId,
      categoryName: checkpointsDB.categories[categoryId as keyof typeof checkpointsDB.categories].name,
      checkpoints,
      stats: reportStatistics.calculateCategoryStats(
        checkpoints as unknown as DBCheckpoint[]
      )
    }));

    // Calculate overall stats
    const summary = reportStatistics.calculateOverallStats(
      categories.map(c => c.stats)
    );

    return {
      projectId: project.id,
      projectTitle: project.title,
      projectAddress: project.address,
      generatedAt: new Date(),
      finishMode: project.finishMode,
      participants: project.participants || [],
      categories,
      summary
    };
  }
}

export const reportDataMapper = new ReportDataMapper();