import type { DBCheckpoint, CheckpointStatus } from '@/types';

export interface CategoryStats {
  total: number;
  complies: number;
  defects: number;
  notInspected: number;
  percentage: number;
}

export interface OverallStats {
  totalCheckpoints: number;
  totalComplies: number;
  totalDefects: number;
  totalNotInspected: number;
  overallPercentage: number;
}

export class ReportStatistics {
  /**
   * Calculate stats for single category
   */
  calculateCategoryStats(checkpoints: DBCheckpoint[]): CategoryStats {
    let complies = 0;
    let defects = 0;
    let notInspected = 0;

    checkpoints.forEach(checkpoint => {
      if (!checkpoint.status || checkpoint.status === 'not_inspected') {
        notInspected++;
      } else if (checkpoint.status === 'complies') {
        complies++;
      } else if (checkpoint.status === 'defect') {
        defects++;
      }
    });

    const total = checkpoints.length;
    const percentage = total > 0
      ? Math.round(((complies + defects) / total) * 100)
      : 0;

    return { total, complies, defects, notInspected, percentage };
  }

  /**
   * Calculate overall stats from multiple categories
   */
  calculateOverallStats(categoryStats: CategoryStats[]): OverallStats {
    const totals = categoryStats.reduce(
      (acc, stats) => ({
        totalCheckpoints: acc.totalCheckpoints + stats.total,
        totalComplies: acc.totalComplies + stats.complies,
        totalDefects: acc.totalDefects + stats.defects,
        totalNotInspected: acc.totalNotInspected + stats.notInspected
      }),
      { totalCheckpoints: 0, totalComplies: 0, totalDefects: 0, totalNotInspected: 0 }
    );

    const overallPercentage = totals.totalCheckpoints > 0
      ? Math.round(
          ((totals.totalComplies + totals.totalDefects) / totals.totalCheckpoints) * 100
        )
      : 0;

    return { ...totals, overallPercentage };
  }
}

export const reportStatistics = new ReportStatistics();