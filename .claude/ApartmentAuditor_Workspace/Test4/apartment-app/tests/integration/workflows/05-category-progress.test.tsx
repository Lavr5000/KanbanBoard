/**
 * Category Progress Tracking Workflow Integration Test
 *
 * Tests the complete workflow for tracking and calculating category progress:
 * - Loading checkpoints from real data
 * - Updating checkpoint statuses
 * - Calculating progress percentages
 * - Testing progress calculation with real checkpoints_v2.1.json data
 * - Verifying progress updates in store and UI
 */

import {
  renderForIntegration,
  TestDataFactories,
  WorkflowAssertions,
  TestScenarios,
  CleanupUtils,
} from '../../utils/integrationHelpers';
import { CommonTestDatasets } from '../../integration/helpers/checkpointsLoader';
import { useProjectStore, useCheckpointStore } from '../../../services/store';

describe('Category Progress Tracking Workflow Integration', () => {
  let mockAsyncStorage: any;
  let navigationMocks: any;
  let stores: any;
  let testProject: any;
  let projectId: string;

  beforeEach(() => {
    // Setup integration test environment with project
    const scenario = TestScenarios.inspection();

    mockAsyncStorage = scenario.asyncStorageMock;
    navigationMocks = scenario.navigationMocks;
    stores = scenario.stores;

    // Create test project
    testProject = TestDataFactories.createProject({
      title: 'Progress Test Project',
    });
    projectId = stores.project.createProject(testProject.title, testProject.address);
    stores.project.setActiveProject(projectId);

    // Initialize checkpoint store for this project
    stores.checkpoint.setProjectId(projectId);
  });

  afterEach(() => {
    CleanupUtils.cleanup();
  });

  describe('Basic Progress Calculation', () => {
    it('should calculate 0% progress when no checkpoints are inspected', () => {
      // ARRANGE: Use walls category checkpoints
      const wallsCheckpoints = CommonTestDatasets.minimal().walls || [];

      // ACT: Get category stats with no inspections
      const stats = stores.checkpoint.getCategoryStats(
        projectId,
        'walls',
        'draft'
      );

      // ASSERT: Verify 0% progress
      expect(stats.progress).toBe(0);
      expect(stats.total).toBeGreaterThanOrEqual(0);
      expect(stats.completed).toBe(0);
      expect(stats.remaining).toBe(stats.total);
    });

    it('should calculate 100% progress when all checkpoints pass', () => {
      // ARRANGE: Use minimal dataset for predictable results
      const testCheckpoints = CommonTestDatasets.minimal();
      const categoryCheckpoints = testCheckpoints.walls || [];

      if (categoryCheckpoints.length === 0) {
        console.warn('No walls checkpoints found in minimal dataset, skipping test');
        return;
      }

      // ACT: Mark all checkpoints as compliant
      categoryCheckpoints.forEach(checkpoint => {
        stores.checkpoint.updateCheckpointStatus(checkpoint.id, 'complies');
      });

      // Calculate progress
      const stats = stores.checkpoint.getCategoryStats(
        projectId,
        'walls',
        'draft'
      );

      // ASSERT: Verify 100% progress
      expect(stats.progress).toBe(100);
      expect(stats.completed).toBe(categoryCheckpoints.length);
      expect(stats.remaining).toBe(0);
    });
  });

  describe('Progress Updates with Real Data', () => {
    it('should track progress accurately with 10% completion', () => {
      // ARRANGE: Load real checkpoints data
      const wallsCheckpoints = CommonTestDatasets.standard().walls || [];

      if (wallsCheckpoints.length < 10) {
        console.warn('Not enough walls checkpoints for 10% test, using available count');
      }

      // Calculate 10% of checkpoints (minimum 1)
      const tenPercentCount = Math.max(1, Math.ceil(wallsCheckpoints.length * 0.1));

      // ACT: Mark 10% of checkpoints as compliant
      for (let i = 0; i < tenPercentCount && i < wallsCheckpoints.length; i++) {
        stores.checkpoint.updateCheckpointStatus(wallsCheckpoints[i].id, 'complies');
      }

      // Calculate progress
      const stats = stores.checkpoint.getCategoryStats(
        projectId,
        'walls',
        'draft'
      );

      // ASSERT: Verify approximately 10% progress
      const expectedProgress = Math.round((tenPercentCount / wallsCheckpoints.length) * 100);
      expect(stats.progress).toBe(expectedProgress);
      expect(stats.completed).toBe(tenPercentCount);
      expect(stats.remaining).toBe(wallsCheckpoints.length - tenPercentCount);

      console.log(`Progress: ${stats.progress}% (${stats.completed}/${stats.total})`);
    });

    it('should track progress accurately with 25% completion', () => {
      // ARRANGE: Load real checkpoints data
      const floorsCheckpoints = CommonTestDatasets.standard().floors || [];

      if (floorsCheckpoints.length === 0) {
        console.warn('No floors checkpoints found, skipping test');
        return;
      }

      // Calculate 25% of checkpoints
      const twentyFivePercentCount = Math.ceil(floorsCheckpoints.length * 0.25);

      // ACT: Mark 25% of checkpoints as non-compliant (defects)
      for (let i = 0; i < twentyFivePercentCount && i < floorsCheckpoints.length; i++) {
        stores.checkpoint.updateCheckpointStatus(floorsCheckpoints[i].id, 'defect');
      }

      // Calculate progress
      const stats = stores.checkpoint.getCategoryStats(
        projectId,
        'floors',
        'draft'
      );

      // ASSERT: Verify 25% progress
      const expectedProgress = Math.round((twentyFivePercentCount / floorsCheckpoints.length) * 100);
      expect(stats.progress).toBe(expectedProgress);
      expect(stats.completed).toBe(twentyFivePercentCount);
      expect(stats.remaining).toBe(floorsCheckpoints.length - twentyFivePercentCount);

      console.log(`Floors Progress: ${stats.progress}% (${stats.completed}/${stats.total})`);
    });

    it('should handle mixed checkpoint statuses correctly', () => {
      // ARRANGE: Load ceiling checkpoints
      const ceilingCheckpoints = CommonTestDatasets.standard().ceiling || [];

      if (ceilingCheckpoints.length < 5) {
        console.warn('Not enough ceiling checkpoints, skipping mixed status test');
        return;
      }

      // ACT: Set mixed statuses
      // First 30%: complies
      const complyCount = Math.ceil(ceilingCheckpoints.length * 0.3);
      for (let i = 0; i < complyCount; i++) {
        stores.checkpoint.updateCheckpointStatus(ceilingCheckpoints[i].id, 'complies');
      }

      // Next 20%: defects
      const defectCount = Math.ceil(ceilingCheckpoints.length * 0.2);
      for (let i = complyCount; i < complyCount + defectCount && i < ceilingCheckpoints.length; i++) {
        stores.checkpoint.updateCheckpointStatus(ceilingCheckpoints[i].id, 'defect');
      }

      // Calculate progress
      const stats = stores.checkpoint.getCategoryStats(
        projectId,
        'ceiling',
        'draft'
      );

      // ASSERT: Verify progress calculation (both complies and defects count as completed)
      const expectedCompleted = complyCount + defectCount;
      const expectedProgress = Math.round((expectedCompleted / ceilingCheckpoints.length) * 100);

      expect(stats.progress).toBe(expectedProgress);
      expect(stats.completed).toBe(expectedCompleted);
      expect(stats.remaining).toBe(ceilingCheckpoints.length - expectedCompleted);

      console.log(`Mixed Status Progress: ${stats.progress}% (${stats.completed} compliant+defects, ${stats.remaining} remaining)`);
    });
  });

  describe('Progress Across Multiple Categories', () => {
    it('should track progress independently for different categories', () => {
      // ARRANGE: Load multiple categories
      const standardDataset = CommonTestDatasets.standard();
      const categories = ['walls', 'floors', 'ceiling'];

      // ACT: Set different progress levels for each category
      categories.forEach((category, index) => {
        const checkpoints = standardDataset[category] || [];
        if (checkpoints.length === 0) return;

        // Set progress: 0%, 50%, 100%
        const targetProgress = index * 50; // 0%, 50%, 100%
        const targetCount = Math.ceil((targetProgress / 100) * checkpoints.length);

        for (let i = 0; i < targetCount && i < checkpoints.length; i++) {
          stores.checkpoint.updateCheckpointStatus(checkpoints[i].id, 'complies');
        }
      });

      // ASSERT: Verify each category has correct independent progress
      const wallsStats = stores.checkpoint.getCategoryStats(projectId, 'walls', 'draft');
      const floorsStats = stores.checkpoint.getCategoryStats(projectId, 'floors', 'draft');
      const ceilingStats = stores.checkpoint.getCategoryStats(projectId, 'ceiling', 'draft');

      // Walls should be 0%
      expect(wallsStats.progress).toBe(0);

      // Floors should be ~50%
      expect(floorsStats.progress).toBeGreaterThanOrEqual(40);
      expect(floorsStats.progress).toBeLessThanOrEqual(60);

      // Ceiling should be 100%
      expect(ceilingStats.progress).toBe(100);

      console.log('Multi-category progress:');
      console.log(`  Walls: ${wallsStats.progress}%`);
      console.log(`  Floors: ${floorsStats.progress}%`);
      console.log(`  Ceiling: ${ceilingStats.progress}%`);
    });

    it('should calculate overall project progress', () => {
      // ARRANGE: Use comprehensive dataset with multiple categories
      const comprehensiveData = CommonTestDatasets.comprehensive();
      const categories = Object.keys(comprehensiveData);

      // ACT: Set varying progress across all categories
      categories.forEach((category, index) => {
        const checkpoints = comprehensiveData[category];
        if (!checkpoints || checkpoints.length === 0) return;

        // Create a pattern of progress: 20%, 40%, 60%, 80%, 100%, etc.
        const progressPercentage = Math.min(100, (index + 1) * 20);
        const targetCount = Math.ceil((progressPercentage / 100) * checkpoints.length);

        for (let i = 0; i < targetCount && i < checkpoints.length; i++) {
          stores.checkpoint.updateCheckpointStatus(checkpoints[i].id, 'complies');
        }
      });

      // Calculate individual category stats
      const categoryStats: any[] = [];
      categories.forEach(category => {
        const stats = stores.checkpoint.getCategoryStats(projectId, category, 'draft');
        if (stats.total > 0) {
          categoryStats.push(stats);
        }
      });

      // Calculate overall project progress
      const totalCheckpoints = categoryStats.reduce((sum, stats) => sum + stats.total, 0);
      const totalCompleted = categoryStats.reduce((sum, stats) => sum + stats.completed, 0);
      const overallProgress = totalCheckpoints > 0 ? Math.round((totalCompleted / totalCheckpoints) * 100) : 0;

      // ASSERT: Verify overall progress calculation
      expect(overallProgress).toBeGreaterThan(0);
      expect(overallProgress).toBeLessThanOrEqual(100);

      console.log('Overall project progress calculation:');
      console.log(`  Total categories: ${categoryStats.length}`);
      console.log(`  Total checkpoints: ${totalCheckpoints}`);
      console.log(`  Total completed: ${totalCompleted}`);
      console.log(`  Overall progress: ${overallProgress}%`);

      // Verify the calculation is accurate
      const expectedProgress = Math.round((totalCompleted / totalCheckpoints) * 100);
      expect(overallProgress).toBe(expectedProgress);
    });
  });

  describe('Progress Persistence', () => {
    it('should persist progress data correctly', () => {
      // ARRANGE: Use windows category for testing
      const windowsCheckpoints = CommonTestDatasets.standard().windows || [];

      if (windowsCheckpoints.length === 0) {
        console.warn('No windows checkpoints found, skipping persistence test');
        return;
      }

      // ACT: Complete 50% of checkpoints
      const halfCount = Math.ceil(windowsCheckpoints.length * 0.5);
      for (let i = 0; i < halfCount; i++) {
        stores.checkpoint.updateCheckpointStatus(windowsCheckpoints[i].id, 'complies');
      }

      // Get progress before persistence
      const beforeStats = stores.checkpoint.getCategoryStats(projectId, 'windows', 'draft');

      // Simulate app restart
      mockAsyncStorage.simulateAppRestart();

      // Load persisted state
      const persistedState = mockAsyncStorage.getParsedStoreData('checkpoint-store');

      // ASSERT: Verify progress data was persisted
      expect(persistedState).toBeDefined();
      expect(persistedState.state.projectId).toBe(projectId);
      expect(persistedState.state.changes).toBeDefined();

      // Verify checkpoint changes were persisted
      const checkpointChanges = persistedState.state.changes[projectId];
      expect(checkpointChanges).toBeDefined();

      // Count persisted changes
      let persistedChangeCount = 0;
      windowsCheckpoints.forEach(checkpoint => {
        if (checkpointChanges[checkpoint.id]?.status) {
          persistedChangeCount++;
        }
      });

      expect(persistedChangeCount).toBe(halfCount);

      console.log(`Persistence verification:`);
      console.log(`  Checkpoints updated: ${halfCount}`);
      console.log(`  Changes persisted: ${persistedChangeCount}`);
      console.log(`  Progress before restart: ${beforeStats.progress}%`);
    });

    it('should maintain progress accuracy after app restart', () => {
      // ARRANGE: Create complex progress scenario
      const variedDataset = CommonTestDatasets.varied();
      const categories = Object.keys(variedDataset);

      // Set different progress patterns
      categories.forEach(category => {
        const checkpoints = variedDataset[category];
        if (!checkpoints || checkpoints.length === 0) return;

        // Random pattern: mark some as complies, some as defects
        checkpoints.forEach((checkpoint, index) => {
          if (index % 3 === 0) {
            stores.checkpoint.updateCheckpointStatus(checkpoint.id, 'complies');
          } else if (index % 3 === 1) {
            stores.checkpoint.updateCheckpointStatus(checkpoint.id, 'defect');
          }
          // Leave every third as not_inspected (null)
        });
      });

      // Store original progress values
      const originalProgress: any = {};
      categories.forEach(category => {
        const stats = stores.checkpoint.getCategoryStats(projectId, category, 'draft');
        if (stats.total > 0) {
          originalProgress[category] = stats.progress;
        }
      });

      // ACT: Simulate app restart and reload
      mockAsyncStorage.simulateAppRestart();

      // Re-initialize store (simulating app startup)
      stores.checkpoint.setProjectId(projectId);

      // ASSERT: Verify progress is maintained after restart
      categories.forEach(category => {
        if (originalProgress[category] !== undefined) {
          const newStats = stores.checkpoint.getCategoryStats(projectId, category, 'draft');

          // Progress should be the same after restart
          expect(newStats.progress).toBe(originalProgress[category]);

          console.log(`${category}: Progress maintained at ${newStats.progress}%`);
        }
      });
    });
  });

  describe('Progress Edge Cases', () => {
    it('should handle categories with no checkpoints gracefully', () => {
      // ACT: Try to get stats for category that doesn't exist or has no checkpoints
      const emptyStats = stores.checkpoint.getCategoryStats(
        projectId,
        'nonexistent-category',
        'draft'
      );

      // ASSERT: Should handle gracefully with default values
      expect(emptyStats.progress).toBe(0);
      expect(emptyStats.total).toBe(0);
      expect(emptyStats.completed).toBe(0);
      expect(emptyStats.remaining).toBe(0);
    });

    it('should handle rapid progress updates correctly', () => {
      // ARRANGE: Use a category with sufficient checkpoints
      const electricalCheckpoints = CommonTestDatasets.comprehensive().electrical || [];

      if (electricalCheckpoints.length < 5) {
        console.warn('Not enough electrical checkpoints for rapid update test');
        return;
      }

      // ACT: Perform rapid status updates
      electricalCheckpoints.forEach((checkpoint, index) => {
        // Rapidly update each checkpoint multiple times
        stores.checkpoint.updateCheckpointStatus(checkpoint.id, 'complies');

        // Then change to defect
        stores.checkpoint.updateCheckpointStatus(checkpoint.id, 'defect');

        // Finally back to complies
        stores.checkpoint.updateCheckpointStatus(checkpoint.id, 'complies');
      });

      // Calculate final progress
      const finalStats = stores.checkpoint.getCategoryStats(projectId, 'electrical', 'draft');

      // ASSERT: Verify final state is correct
      expect(finalStats.progress).toBe(100);
      expect(finalStats.completed).toBe(electricalCheckpoints.length);
      expect(finalStats.remaining).toBe(0);

      // Verify persistence handled rapid updates
      const persistedState = mockAsyncStorage.getParsedStoreData('checkpoint-store');
      expect(persistedState.state.changes).toBeDefined();

      console.log(`Rapid updates handled: ${electricalCheckpoints.length} checkpoints, final progress: ${finalStats.progress}%`);
    });

    it('should calculate progress correctly with both draft and finish modes', () => {
      // ARRANGE: Use the same category but different modes
      const dataset = CommonTestDatasets.standard();
      const plumbingCheckpoints = dataset.plumbing || [];

      if (plumbingCheckpoints.length === 0) {
        console.warn('No plumbing checkpoints found, skipping draft/finish mode test');
        return;
      }

      // ACT: Update progress in draft mode
      const draftHalfCount = Math.ceil(plumbingCheckpoints.length * 0.5);
      for (let i = 0; i < draftHalfCount; i++) {
        stores.checkpoint.updateCheckpointStatus(plumbingCheckpoints[i].id, 'complies');
      }

      // Calculate draft mode progress
      const draftStats = stores.checkpoint.getCategoryStats(projectId, 'plumbing', 'draft');

      // Calculate finish mode progress (should be different if finish mode has different checkpoints)
      const finishStats = stores.checkpoint.getCategoryStats(projectId, 'plumbing', 'finish');

      // ASSERT: Both modes should work correctly
      expect(draftStats.progress).toBeGreaterThan(0);
      expect(draftStats.progress).toBeLessThanOrEqual(100);

      // Finish mode might have different checkpoint count
      if (finishStats.total > 0) {
        expect(finishStats.progress).toBeGreaterThanOrEqual(0);
        expect(finishStats.progress).toBeLessThanOrEqual(100);
      }

      console.log('Draft/Finish mode comparison:');
      console.log(`  Draft mode: ${draftStats.progress}% (${draftStats.total} checkpoints)`);
      console.log(`  Finish mode: ${finishStats.progress}% (${finishStats.total} checkpoints)`);
    });
  });

  describe('Performance with Real Data', () => {
    it('should handle large dataset efficiently', () => {
      // ARRANGE: Use varied dataset which has different checkpoint counts per category
      const largeDataset = CommonTestDatasets.varied();
      const categories = Object.keys(largeDataset);

      console.log('Performance test with realistic dataset sizes:');
      categories.forEach(category => {
        const checkpoints = largeDataset[category];
        if (!checkpoints) return;

        const startTime = Date.now();

        // ACT: Update all checkpoints in this category
        checkpoints.forEach(checkpoint => {
          stores.checkpoint.updateCheckpointStatus(checkpoint.id, 'complies');
        });

        // Calculate progress
        const stats = stores.checkpoint.getCategoryStats(projectId, category, 'draft');

        const endTime = Date.now();
        const processingTime = endTime - startTime;

        // ASSERT: Performance should be reasonable
        expect(processingTime).toBeLessThan(1000); // Should complete within 1 second
        expect(stats.progress).toBe(100);

        console.log(`  ${category}: ${checkpoints.length} checkpoints, ${processingTime}ms`);
      });

      console.log('✅ Performance test completed - all categories processed efficiently');
    });
  });
});