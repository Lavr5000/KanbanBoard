/**
 * Checkpoints Data Loader
 *
 * Loads real checkpoints data from checkpoints_v2.1.json for integration tests.
 * Provides utilities to:
 * - Load real checkpoint data (383 checkpoints, 10 categories)
 * - Create test subsets for performance
 * - Filter checkpoints by category and criteria
 */

import checkpointsDB from '../../../constants/checkpoints_v2.1.json';

// Types based on the actual JSON structure
export interface RealCheckpoint {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  tolerance: string;
  method: string;
  standardReference: string;
  violationText: string;
  hintLayman: string;
  referenceImageUrl: string;
  status?: 'complies' | 'defect' | 'not_inspected' | null;
  userPhotos: string[];
  userComment: string;
}

export interface CheckpointsDatabase {
  version: string;
  totalCheckpoints: number;
  categories: {
    [categoryId: string]: {
      draft: RealCheckpoint[];
      finish: RealCheckpoint[];
    };
  };
}

/**
 * Load the full checkpoints database
 */
export const loadFullCheckpointsDatabase = (): CheckpointsDatabase => {
  return checkpointsDB as CheckpointsDatabase;
};

/**
 * Get all categories from the database
 */
export const getAllCategories = (): string[] => {
  const db = loadFullCheckpointsDatabase();
  return Object.keys(db.categories);
};

/**
 * Get checkpoints for a specific category and mode
 */
export const getCheckpointsByCategory = (
  categoryId: string,
  mode: 'draft' | 'finish' = 'draft'
): RealCheckpoint[] => {
  const db = loadFullCheckpointsDatabase();
  return db.categories[categoryId]?.[mode] || [];
};

/**
 * Create a test subset of checkpoints for performance
 * Returns first N checkpoints from each category
 */
export const createTestSubset = (
  checkpointsPerCategory: number = 5,
  mode: 'draft' | 'finish' = 'draft'
): { [categoryId: string]: RealCheckpoint[] } => {
  const db = loadFullCheckpointsDatabase();
  const subset: { [categoryId: string]: RealCheckpoint[] } = {};

  Object.keys(db.categories).forEach(categoryId => {
    const categoryCheckpoints = db.categories[categoryId][mode];
    subset[categoryId] = categoryCheckpoints.slice(0, checkpointsPerCategory);
  });

  return subset;
};

/**
 * Create a comprehensive test dataset with specified checkpoint counts
 */
export const createTestDataset = (
  config: {
    walls?: number;
    floors?: number;
    ceiling?: number;
    windows?: number;
    doors?: number;
    plumbing?: number;
    electrical?: number;
    hvac?: number;
    gas?: number;
    [key: string]: number;
  },
  mode: 'draft' | 'finish' = 'draft'
): { [categoryId: string]: RealCheckpoint[] } => {
  const db = loadFullCheckpointsDatabase();
  const dataset: { [categoryId: string]: RealCheckpoint[] } = {};

  getAllCategories().forEach(categoryId => {
    const count = config[categoryId] || 5; // Default to 5 if not specified
    const categoryCheckpoints = db.categories[categoryId][mode];
    dataset[categoryId] = categoryCheckpoints.slice(0, Math.min(count, categoryCheckpoints.length));
  });

  return dataset;
};

/**
 * Get checkpoint statistics
 */
export const getCheckpointStats = () => {
  const db = loadFullCheckpointsDatabase();
  const stats: { [categoryId: string]: { draft: number; finish: number } } = {};

  Object.keys(db.categories).forEach(categoryId => {
    stats[categoryId] = {
      draft: db.categories[categoryId].draft.length,
      finish: db.categories[categoryId].finish.length,
    };
  });

  return {
    totalCategories: Object.keys(db.categories).length,
    totalCheckpoints: db.totalCheckpoints,
    version: db.version,
    categoryStats: stats,
  };
};

/**
 * Filter checkpoints by criteria
 */
export const filterCheckpoints = (
  checkpoints: RealCheckpoint[],
  criteria: {
    hasReferenceImage?: boolean;
    requiresTolerance?: boolean;
    hasMethod?: boolean;
    keyword?: string;
  }
): RealCheckpoint[] => {
  return checkpoints.filter(checkpoint => {
    if (criteria.hasReferenceImage && !checkpoint.referenceImageUrl) {
      return false;
    }

    if (criteria.requiresTolerance && !checkpoint.tolerance) {
      return false;
    }

    if (criteria.hasMethod && !checkpoint.method) {
      return false;
    }

    if (criteria.keyword) {
      const keyword = criteria.keyword.toLowerCase();
      const searchIn = [
        checkpoint.title,
        checkpoint.description,
        checkpoint.hintLayman,
        checkpoint.violationText,
      ].join(' ').toLowerCase();

      if (!searchIn.includes(keyword)) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Create checkpoints with test data modifications
 */
export const createTestCheckpoints = (
  baseCheckpoints: RealCheckpoint[],
  modifications: {
    status?: RealCheckpoint['status'];
    userPhotos?: string[];
    userComment?: string;
  } = {}
): RealCheckpoint[] => {
  return baseCheckpoints.map(checkpoint => ({
    ...checkpoint,
    status: modifications.status ?? checkpoint.status,
    userPhotos: modifications.userPhotos ?? checkpoint.userPhotos,
    userComment: modifications.userComment ?? checkpoint.userComment,
  }));
};

/**
 * Common test datasets for integration tests
 */
export const CommonTestDatasets = {
  // Small dataset for quick tests (1 checkpoint per category)
  minimal: () => createTestSubset(1),

  // Medium dataset for standard tests (3 checkpoints per category)
  standard: () => createTestSubset(3),

  // Large dataset for comprehensive tests (10 checkpoints per category)
  comprehensive: () => createTestSubset(10),

  // Custom dataset with varied counts per category
  varied: () => createTestDataset({
    walls: 10,    // More walls checkpoints for detailed testing
    floors: 8,
    ceiling: 5,
    windows: 7,
    doors: 6,
    plumbing: 4,
    electrical: 9,  // More electrical for safety testing
    hvac: 3,
    gas: 2,        // Fewer gas checkpoints for safety
  }),

  // Dataset focused on specific criteria
  withImages: () => {
    const db = loadFullCheckpointsDatabase();
    const result: { [categoryId: string]: RealCheckpoint[] } = {};

    Object.keys(db.categories).forEach(categoryId => {
      const withImages = filterCheckpoints(db.categories[categoryId].draft, {
        hasReferenceImage: true,
      });
      result[categoryId] = withImages.slice(0, 5); // Limit to 5 per category
    });

    return result;
  },
};

/**
 * Utility to print checkpoint statistics (useful for test debugging)
 */
export const printCheckpointStats = (dataset?: { [categoryId: string]: RealCheckpoint[] }) => {
  if (!dataset) {
    const stats = getCheckpointStats();
    console.log('=== Full Database Stats ===');
    console.log(`Version: ${stats.version}`);
    console.log(`Total Categories: ${stats.totalCategories}`);
    console.log(`Total Checkpoints: ${stats.totalCheckpoints}`);
    console.log('Category Breakdown:');
    Object.entries(stats.categoryStats).forEach(([category, counts]) => {
      console.log(`  ${category}: ${counts.draft} draft, ${counts.finish} finish`);
    });
  } else {
    console.log('=== Dataset Stats ===');
    Object.entries(dataset).forEach(([category, checkpoints]) => {
      console.log(`${category}: ${checkpoints.length} checkpoints`);
    });
  }
};

// Export the full database for direct access
export { checkpointsDB };
export default {
  loadFullCheckpointsDatabase,
  getAllCategories,
  getCheckpointsByCategory,
  createTestSubset,
  createTestDataset,
  getCheckpointStats,
  filterCheckpoints,
  createTestCheckpoints,
  CommonTestDatasets,
  printCheckpointStats,
  checkpointsDB,
};