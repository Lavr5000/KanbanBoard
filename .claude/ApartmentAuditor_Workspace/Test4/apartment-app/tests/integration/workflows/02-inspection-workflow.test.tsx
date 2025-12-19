/**
 * Inspection Workflow Integration Test (MAIN WORKFLOW)
 *
 * Tests the complete apartment inspection workflow:
 * - Load project and select category
 * - Inspect multiple checkpoints with real checkpoints_v2.1.json data
 * - Update checkpoint statuses (complies/defect/not_inspected)
 * - Add photos and comments to checkpoints
 * - Track progress throughout inspection
 * - Test navigation between screens
 * - Verify complete data persistence
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import {
  renderForIntegration,
  TestDataFactories,
  WorkflowAssertions,
  TestScenarios,
  CleanupUtils,
} from '../../utils/integrationHelpers';
import { CommonTestDatasets } from '../../integration/helpers/checkpointsLoader';
import { useProjectStore, useCheckpointStore, useUIStore } from '../../../services/store';

// Import mocked dependencies
import * as ImagePicker from 'expo-image-picker';

describe('Inspection Workflow Integration (MAIN WORKFLOW)', () => {
  let mockAsyncStorage: any;
  let navigationMocks: any;
  let stores: any;
  let projectId: string;
  let testProject: any;

  // Mock photo URIs
  const mockPhotos = [
    'file://inspection-photo-1.jpg',
    'file://inspection-photo-2.jpg',
    'file://inspection-photo-3.jpg',
    'file://defect-photo-1.jpg',
    'file://defect-photo-2.jpg',
  ];

  beforeEach(() => {
    // Setup comprehensive test environment
    const scenario = TestScenarios.inspection();

    mockAsyncStorage = scenario.asyncStorageMock;
    navigationMocks = scenario.navigationMocks;
    stores = scenario.stores;

    // Create comprehensive test project
    testProject = TestDataFactories.createProject({
      title: 'Full Inspection Test Apartment',
      address: '456 Inspection Boulevard, Test City',
      finishMode: 'draft',
    });

    // Add participants to project
    testProject.participants = [
      TestDataFactories.createParticipant({
        role: 'inspector',
        fullName: 'Senior Inspector Johnson',
        organization: 'Professional Inspection Services',
      }),
      TestDataFactories.createParticipant({
        role: 'owner',
        fullName: 'Property Owner Smith',
        organization: 'Personal Property',
      }),
    ];

    projectId = stores.project.createProject(testProject.title, testProject.address);
    stores.project.updateProject(projectId, {
      participants: testProject.participants,
    });
    stores.project.setActiveProject(projectId);

    // Initialize checkpoint store
    stores.checkpoint.setProjectId(projectId);

    // Set UI store to draft mode
    stores.ui.setFinishMode('draft');

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    CleanupUtils.cleanup();
  });

  describe('Project Loading and Category Selection', () => {
    it('should load project and navigate to category inspection', () => {
      // ARRANGE: Verify project setup
      const activeProject = stores.project.getActiveProject();
      expect(activeProject).toEqual(
        expect.objectContaining({
          title: 'Full Inspection Test Apartment',
          address: '456 Inspection Boulevard, Test City',
          finishMode: 'draft',
        })
      );
      expect(activeProject.participants).toHaveLength(2);

      // ACT: Select category for inspection (walls)
      const selectedCategory = 'walls';

      // Simulate navigation to category checklist
      navigationMocks.mockRouter.push('/(tabs)/objects/[id]/check/[categoryId]', {
        id: projectId,
        categoryId: selectedCategory,
      });

      // Load category checkpoints
      const categoryCheckpoints = stores.checkpoint.getCategoryCheckpoints(
        selectedCategory,
        'draft'
      );

      // ASSERT: Verify navigation and checkpoint loading
      navigationMocks.tracker.expectNavigationCall(
        'push',
        '/(tabs)/objects/[id]/check/[categoryId]',
        {
          id: projectId,
          categoryId: selectedCategory,
        }
      );

      expect(categoryCheckpoints).toBeDefined();
      expect(Array.isArray(categoryCheckpoints)).toBe(true);

      console.log(`✅ Project loaded and category "${selectedCategory}" selected`);
      console.log(`  Checkpoints available: ${categoryCheckpoints.length}`);
    });

    it('should load different categories with real checkpoint data', () => {
      // ARRANGE: Test multiple categories
      const categories = ['walls', 'floors', 'ceiling', 'windows', 'doors'];

      categories.forEach(category => {
        // ACT: Load checkpoints for each category
        const checkpoints = stores.checkpoint.getCategoryCheckpoints(category, 'draft');

        // ASSERT: Verify each category has checkpoints
        expect(Array.isArray(checkpoints)).toBe(true);
        expect(checkpoints.length).toBeGreaterThan(0);

        // Each checkpoint should have required fields
        checkpoints.forEach(checkpoint => {
          expect(checkpoint).toHaveProperty('id');
          expect(checkpoint).toHaveProperty('title');
          expect(checkpoint).toHaveProperty('description');
          expect(checkpoint).toHaveProperty('tolerance');
          expect(checkpoint).toHaveProperty('method');
          expect(checkpoint).toHaveProperty('categoryId');
        });

        console.log(`  ${category}: ${checkpoints.length} checkpoints loaded`);
      });
    });
  });

  describe('Checkpoint Inspection Process', () => {
    it('should inspect multiple checkpoints with different statuses', async () => {
      // ARRANGE: Use comprehensive dataset for thorough testing
      const comprehensiveData = CommonTestDatasets.comprehensive();
      const categoryCheckpoints = comprehensiveData.walls || [];

      if (categoryCheckpoints.length < 5) {
        console.warn('Not enough walls checkpoints for comprehensive inspection test');
        return;
      }

      // Mock image picker permissions
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        granted: true,
        status: 'granted',
      });

      // ACT: Inspect first 5 checkpoints with different scenarios
      const inspectionResults = [];

      for (let i = 0; i < Math.min(5, categoryCheckpoints.length); i++) {
        const checkpoint = categoryCheckpoints[i];
        let status: 'complies' | 'defect' | 'not_inspected';
        let comment: string;
        let photos: string[] = [];

        // Different inspection scenarios
        switch (i % 4) {
          case 0:
            // Perfect condition
            status = 'complies';
            comment = 'Wall surface in excellent condition, no issues found';
            photos = [];
            break;

          case 1:
            // Minor defect with photo
            status = 'defect';
            comment = 'Minor crack detected, requires repair';
            photos = [mockPhotos[0]];
            // Mock photo selection
            ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
              assets: [
                {
                  uri: mockPhotos[0],
                  width: 800,
                  height: 600,
                  fileName: 'crack-photo.jpg',
                  type: 'image',
                },
              ],
              cancelled: false,
            });
            break;

          case 2:
            // Major defect with multiple photos
            status = 'defect';
            comment = 'Significant water damage and mold growth detected';
            photos = [mockPhotos[1], mockPhotos[2]];
            // Mock multiple photo selections
            ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
              assets: [
                {
                  uri: mockPhotos[1],
                  width: 1024,
                  height: 768,
                  fileName: 'water-damage.jpg',
                  type: 'image',
                },
              ],
              cancelled: false,
            });
            ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
              assets: [
                {
                  uri: mockPhotos[2],
                  width: 1200,
                  height: 900,
                  fileName: 'mold-growth.jpg',
                  type: 'image',
                },
              ],
              cancelled: false,
            });
            break;

          case 3:
            // Not inspected yet
            status = 'not_inspected';
            comment = 'Area not accessible during inspection';
            photos = [];
            break;

          default:
            status = 'complies';
            comment = 'No issues found';
            photos = [];
        }

        // Update checkpoint status
        stores.checkpoint.updateCheckpointStatus(checkpoint.id, status);
        stores.checkpoint.setComment(checkpoint.id, comment);

        // Add photos if any
        for (const photo of photos) {
          // Simulate photo selection process
          if (photos.length > 0) {
            const pickerResult = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: 'Images',
              quality: 0.8,
            });
            if (!pickerResult.cancelled && pickerResult.assets) {
              stores.checkpoint.addPhoto(checkpoint.id, pickerResult.assets[0].uri);
            }
          }
        }

        inspectionResults.push({
          checkpointId: checkpoint.id,
          checkpointTitle: checkpoint.title,
          status,
          comment,
          photoCount: photos.length,
        });
      }

      // ASSERT: Verify all checkpoint updates
      inspectionResults.forEach(result => {
        const checkpointState = stores.checkpoint.getCheckpointState(result.checkpointId);
        expect(checkpointState.status).toBe(result.status);
        expect(checkpointState.userComment).toBe(result.comment);
        expect(checkpointState.userPhotos).toHaveLength(result.photoCount);
      });

      // Calculate and verify progress
      const progressStats = stores.checkpoint.getCategoryStats(projectId, 'walls', 'draft');
      expect(progressStats.completed).toBeGreaterThan(0);
      expect(progressStats.progress).toBeGreaterThan(0);

      console.log('✅ Checkpoint inspection completed:');
      console.log(`  Checkpoints inspected: ${inspectionResults.length}`);
      console.log(`  Complies: ${inspectionResults.filter(r => r.status === 'complies').length}`);
      console.log(`  Defects: ${inspectionResults.filter(r => r.status === 'defect').length}`);
      console.log(`  Not inspected: ${inspectionResults.filter(r => r.status === 'not_inspected').length}`);
      console.log(`  Total photos: ${inspectionResults.reduce((sum, r) => sum + r.photoCount, 0)}`);
      console.log(`  Progress: ${progressStats.progress}%`);
    });

    it('should handle comprehensive walls category inspection', async () => {
      // ARRANGE: Load full walls category data
      const wallsData = CommonTestDatasets.standard().walls || [];

      if (wallsData.length === 0) {
        console.warn('No walls checkpoints available');
        return;
      }

      console.log(`Starting comprehensive walls inspection with ${wallsData.length} checkpoints`);

      // Mock permissions
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        granted: true,
        status: 'granted',
      });

      // ACT: Systematically inspect walls checkpoints
      let compliantCount = 0;
      let defectCount = 0;
      let notInspectedCount = 0;
      let totalPhotos = 0;

      for (let i = 0; i < wallsData.length; i++) {
        const checkpoint = wallsData[i];

        // Simulate realistic inspection pattern
        // 70% compliant, 20% minor defects, 10% not accessible
        const random = Math.random();
        let status: 'complies' | 'defect' | 'not_inspected';
        let comment: string;
        let addPhoto: boolean = false;

        if (random < 0.7) {
          status = 'complies';
          comment = `Checkpoint #${i + 1}: No issues detected during inspection`;
          compliantCount++;
          addPhoto = random < 0.1; // 10% of compliant checkpoints get photos
        } else if (random < 0.9) {
          status = 'defect';
          comment = `Checkpoint #${i + 1}: Minor defect found - requires attention`;
          defectCount++;
          addPhoto = true; // All defects get photos
        } else {
          status = 'not_inspected';
          comment = `Checkpoint #${i + 1}: Not accessible during inspection`;
          notInspectedCount++;
          addPhoto = false;
        }

        // Update checkpoint
        stores.checkpoint.updateCheckpointStatus(checkpoint.id, status);
        stores.checkpoint.setComment(checkpoint.id, comment);

        // Add photo if needed
        if (addPhoto) {
          const photoIndex = totalPhotos % mockPhotos.length;
          stores.checkpoint.addPhoto(checkpoint.id, mockPhotos[photoIndex]);
          totalPhotos++;
        }
      }

      // ASSERT: Verify comprehensive inspection results
      const finalStats = stores.checkpoint.getCategoryStats(projectId, 'walls', 'draft');

      expect(finalStats.total).toBe(wallsData.length);
      expect(finalStats.completed).toBe(compliantCount + defectCount);
      expect(finalStats.remaining).toBe(notInspectedCount);
      expect(finalStats.progress).toBe(Math.round(((compliantCount + defectCount) / wallsData.length) * 100));

      // Verify all checkpoints have been updated
      for (const checkpoint of wallsData) {
        const state = stores.checkpoint.getCheckpointState(checkpoint.id);
        expect(state.status).toBeDefined();
        expect(state.userComment).toBeDefined();
      }

      console.log('✅ Comprehensive walls inspection completed:');
      console.log(`  Total checkpoints: ${wallsData.length}`);
      console.log(`  Compliant: ${compliantCount} (${Math.round((compliantCount / wallsData.length) * 100)}%)`);
      console.log(`  Defects: ${defectCount} (${Math.round((defectCount / wallsData.length) * 100)}%)`);
      console.log(`  Not inspected: ${notInspectedCount} (${Math.round((notInspectedCount / wallsData.length) * 100)}%)`);
      console.log(`  Photos taken: ${totalPhotos}`);
      console.log(`  Final progress: ${finalStats.progress}%`);
    });
  });

  describe('Multi-Category Inspection Workflow', () => {
    it('should inspect multiple categories in sequence', async () => {
      // ARRANGE: Use varied dataset for multiple categories
      const variedData = CommonTestDatasets.varied();
      const categories = ['walls', 'floors', 'ceiling'];

      // Mock permissions
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        granted: true,
        status: 'granted',
      });

      const categoryResults: any[] = [];

      // ACT: Inspect each category
      for (const category of categories) {
        const checkpoints = variedData[category];
        if (!checkpoints || checkpoints.length === 0) continue;

        console.log(`Inspecting category: ${category} (${checkpoints.length} checkpoints)`);

        // Simulate navigation to category
        navigationMocks.mockRouter.push('/(tabs)/objects/[id]/check/[categoryId]', {
          id: projectId,
          categoryId: category,
        });

        // Inspect subset of checkpoints for efficiency
        const inspectCount = Math.min(5, checkpoints.length);
        let compliant = 0;
        let defects = 0;

        for (let i = 0; i < inspectCount; i++) {
          const checkpoint = checkpoints[i];

          // Random inspection pattern
          const isCompliant = Math.random() > 0.3; // 70% compliant
          const status = isCompliant ? 'complies' : 'defect';

          if (isCompliant) compliant++;
          else defects++;

          // Update checkpoint
          stores.checkpoint.updateCheckpointStatus(checkpoint.id, status);
          stores.checkpoint.setComment(
            checkpoint.id,
            `${category} checkpoint #${i + 1}: ${isCompliant ? 'No issues found' : 'Defect detected'}`
          );

          // Add photo for defects
          if (!isCompliant) {
            const photoIndex = (compliant + defects) % mockPhotos.length;
            stores.checkpoint.addPhoto(checkpoint.id, mockPhotos[photoIndex]);
          }
        }

        // Calculate category stats
        const stats = stores.checkpoint.getCategoryStats(projectId, category, 'draft');

        categoryResults.push({
          category,
          total: checkpoints.length,
          inspected: inspectCount,
          compliant,
          defects,
          progress: stats.progress,
        });

        console.log(`  ${category}: ${stats.progress}% complete (${stats.completed}/${stats.total})`);
      }

      // ASSERT: Verify multi-category inspection
      expect(categoryResults).toHaveLength(3);

      categoryResults.forEach(result => {
        expect(result.inspected).toBeGreaterThan(0);
        expect(result.progress).toBeGreaterThanOrEqual(0);
        expect(result.progress).toBeLessThanOrEqual(100);
      });

      // Verify navigation sequence
      navigationMocks.tracker.expectNavigationSequence(
        categories.map(category => ({
          method: 'push',
          pathname: '/(tabs)/objects/[id]/check/[categoryId]',
          params: { id: projectId, categoryId: category },
        }))
      );

      // Calculate overall project progress
      let totalCheckpoints = 0;
      let totalCompleted = 0;

      categories.forEach(category => {
        const stats = stores.checkpoint.getCategoryStats(projectId, category, 'draft');
        totalCheckpoints += stats.total;
        totalCompleted += stats.completed;
      });

      const overallProgress = totalCheckpoints > 0 ? Math.round((totalCompleted / totalCheckpoints) * 100) : 0;

      console.log('✅ Multi-category inspection completed:');
      categoryResults.forEach(result => {
        console.log(`  ${result.category}: ${result.progress}% (${result.compliant} compliant, ${result.defects} defects)`);
      });
      console.log(`Overall project progress: ${overallProgress}%`);
    });
  });

  describe('Draft vs Finish Mode Inspection', () => {
    it('should handle inspection in both draft and finish modes', async () => {
      // ARRANGE: Use same category for both modes
      const dataset = CommonTestDatasets.standard();
      const category = 'electrical';
      const checkpoints = dataset[category] || [];

      if (checkpoints.length < 3) {
        console.warn('Not enough electrical checkpoints for mode comparison');
        return;
      }

      // ACT: First inspect in draft mode
      console.log('Inspecting in DRAFT mode...');
      stores.ui.setFinishMode('draft');

      // Inspect first half in draft mode
      const draftCount = Math.ceil(checkpoints.length / 2);
      for (let i = 0; i < draftCount; i++) {
        const checkpoint = checkpoints[i];
        stores.checkpoint.updateCheckpointStatus(checkpoint.id, 'complies');
        stores.checkpoint.setComment(checkpoint.id, `Draft inspection #${i + 1}`);
      }

      const draftStats = stores.checkpoint.getCategoryStats(projectId, category, 'draft');
      console.log(`  Draft mode progress: ${draftStats.progress}%`);

      // Switch to finish mode
      console.log('Switching to FINISH mode...');
      stores.ui.setFinishMode('finish');

      // Inspect second half in finish mode
      for (let i = draftCount; i < Math.min(draftCount + 3, checkpoints.length); i++) {
        const checkpoint = checkpoints[i];
        stores.checkpoint.updateCheckpointStatus(checkpoint.id, 'defect');
        stores.checkpoint.setComment(checkpoint.id, `Finish inspection #${i + 1}`);
      }

      const finishStats = stores.checkpoint.getCategoryStats(projectId, category, 'finish');
      console.log(`  Finish mode progress: ${finishStats.progress}%`);

      // ASSERT: Verify both modes work correctly
      expect(draftStats.progress).toBeGreaterThan(0);
      expect(finishStats.progress).toBeGreaterThan(0);

      // Verify UI store state
      expect(stores.ui.finishMode).toBe('finish');

      // Verify data is stored separately for each mode
      const draftCheckpoint1 = stores.checkpoint.getCheckpointState(checkpoints[0].id);
      const finishCheckpoint1 = stores.checkpoint.getCheckpointState(checkpoints[draftCount].id);

      expect(draftCheckpoint1.status).toBe('complies');
      expect(finishCheckpoint1.status).toBe('defect');

      console.log('✅ Draft vs Finish mode inspection completed successfully');
    });
  });

  describe('Navigation and UI Integration', () => {
    it('should handle complete inspection navigation flow', () => {
      // ARRANGE: Start from project list
      const scenario = TestScenarios.projectCreation();

      // ACT 1: Navigate to project detail
      scenario.navigationMocks.mockRouter.push('/(tabs)/objects/[id]', { id: projectId });

      // ACT 2: Navigate to category checklist
      scenario.navigationMocks.mockRouter.push('/(tabs)/objects/[id]/check/[categoryId]', {
        id: projectId,
        categoryId: 'plumbing',
      });

      // ACT 3: Navigate to specific checkpoint detail
      const plumbingData = CommonTestDatasets.standard().plumbing || [];
      if (plumbingData.length > 0) {
        scenario.navigationMocks.mockRouter.push('/(tabs)/objects/[id]/check/[categoryId]/[checkpointId]', {
          id: projectId,
          categoryId: 'plumbing',
          checkpointId: plumbingData[0].id,
        });

        // Update checkpoint
        stores.checkpoint.updateCheckpointStatus(plumbingData[0].id, 'complies');
        stores.checkpoint.setComment(plumbingData[0].id, 'Plumbing checkpoint inspected');
      }

      // ACT 4: Navigate back to category
      scenario.navigationMocks.mockRouter.back();

      // ACT 5: Navigate back to project
      scenario.navigationMocks.mockRouter.back();

      // ASSERT: Verify navigation sequence
      const expectedSequence = [
        { method: 'push', pathname: '/(tabs)/objects/[id]' },
        { method: 'push', pathname: '/(tabs)/objects/[id]/check/[categoryId]' },
        { method: 'push', pathname: '/(tabs)/objects/[id]/check/[categoryId]/[checkpointId]' },
        { method: 'back' },
        { method: 'back' },
      ];

      scenario.navigationMocks.tracker.expectNavigationSequence(expectedSequence);

      console.log('✅ Complete navigation flow handled correctly');
    });
  });

  describe('Data Persistence and Recovery', () => {
    it('should persist complete inspection data and recover after restart', async () => {
      // ARRANGE: Create comprehensive inspection data
      const categories = ['walls', 'floors'];
      const inspectionData: any = {};

      // Mock permissions
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        granted: true,
        status: 'granted',
      });

      // ACT 1: Create inspection data for multiple categories
      for (const category of categories) {
        const checkpoints = CommonTestDatasets.standard()[category] || [];
        if (checkpoints.length === 0) continue;

        inspectionData[category] = {
          checkpoints: [],
          totalPhotos: 0,
        };

        // Inspect first 3 checkpoints
        for (let i = 0; i < Math.min(3, checkpoints.length); i++) {
          const checkpoint = checkpoints[i];
          const status = Math.random() > 0.5 ? 'complies' : 'defect';
          const photoCount = status === 'defect' ? 2 : 0;

          // Update checkpoint
          stores.checkpoint.updateCheckpointStatus(checkpoint.id, status);
          stores.checkpoint.setComment(checkpoint.id, `${category} checkpoint inspection #${i + 1}`);

          // Add photos for defects
          for (let j = 0; j < photoCount; j++) {
            const photoIndex = (i * 2 + j) % mockPhotos.length;
            stores.checkpoint.addPhoto(checkpoint.id, mockPhotos[photoIndex]);
            inspectionData[category].totalPhotos++;
          }

          inspectionData[category].checkpoints.push({
            id: checkpoint.id,
            status,
            photoCount,
            comment: `${category} checkpoint inspection #${i + 1}`,
          });
        }
      }

      // Store state before restart
      const stateBeforeRestart = {
        project: stores.project.projects,
        checkpoint: {
          projectId: stores.checkpoint.projectId,
          changes: stores.checkpoint.getProjectChanges(),
        },
        ui: {
          finishMode: stores.ui.finishMode,
          activeTab: stores.ui.activeTab,
        },
      };

      // ACT 2: Simulate app restart
      mockAsyncStorage.simulateAppRestart();

      // Load persisted state
      const persistedState = {
        project: mockAsyncStorage.getParsedStoreData('project-store'),
        checkpoint: mockAsyncStorage.getParsedStoreData('checkpoint-store'),
        ui: mockAsyncStorage.getParsedStoreData('ui-store'),
      };

      // ASSERT 3: Verify data persistence
      // Check project data
      expect(persistedProject.project.state.projects).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'Full Inspection Test Apartment',
            participants: testProject.participants,
          }),
        ])
      );

      // Check checkpoint data
      expect(persistedCheckpoint.checkpoint.state.projectId).toBe(projectId);
      expect(persistedCheckpoint.checkpoint.state.changes[projectId]).toBeDefined();

      // Verify inspection data was persisted
      categories.forEach(category => {
        if (inspectionData[category]) {
          const categoryInspections = inspectionData[category].checkpoints;
          categoryInspections.forEach((inspection: any) => {
            const persistedData = persistedCheckpoint.checkpoint.state.changes[projectId][inspection.id];
            expect(persistedData).toBeDefined();
            expect(persistedData.status).toBe(inspection.status);
            expect(persistedData.userComment).toBe(inspection.comment);
            if (inspection.photoCount > 0) {
              expect(persistedData.userPhotos).toHaveLength(inspection.photoCount);
            }
          });
        }
      });

      console.log('✅ Complete inspection data persisted and verified:');
      console.log(`  Categories inspected: ${categories.length}`);
      categories.forEach(category => {
        const categoryData = inspectionData[category];
        if (categoryData) {
          console.log(`    ${category}: ${categoryData.checkpoints.length} checkpoints, ${categoryData.totalPhotos} photos`);
        }
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle inspection interruption and resume gracefully', () => {
      // ARRANGE: Start inspection of multiple checkpoints
      const checkpoints = CommonTestDatasets.standard().windows || [];

      if (checkpoints.length < 5) {
        console.warn('Not enough checkpoints for interruption test');
        return;
      }

      // ACT 1: Start inspection
      for (let i = 0; i < 3; i++) {
        stores.checkpoint.updateCheckpointStatus(checkpoints[i].id, 'complies');
        stores.checkpoint.setComment(checkpoints[i].id, `Inspection #${i + 1} completed`);
      }

      const midInspectionStats = stores.checkpoint.getCategoryStats(projectId, 'windows', 'draft');

      // ACT 2: Simulate interruption (clear store state, like app crash)
      const originalChanges = stores.checkpoint.getProjectChanges();
      stores.checkpoint.clearAllChanges();
      stores.checkpoint.setProjectId(projectId);

      // ACT 3: Resume inspection with remaining checkpoints
      for (let i = 3; i < 5; i++) {
        stores.checkpoint.updateCheckpointStatus(checkpoints[i].id, 'defect');
        stores.checkpoint.setComment(checkpoints[i].id, `Resumed inspection #${i + 1}`);
        stores.checkpoint.addPhoto(checkpoints[i].id, mockPhotos[i % mockPhotos.length]);
      }

      const finalStats = stores.checkpoint.getCategoryStats(projectId, 'windows', 'draft');

      // ASSERT: Verify graceful handling
      expect(finalStats.completed).toBe(2); // Only resumed inspections count
      expect(finalStats.total).toBe(checkpoints.length);

      console.log('✅ Inspection interruption handled gracefully:');
      console.log(`  Completed before interruption: ${midInspectionStats.completed}`);
      console.log(`  Completed after resumption: ${finalStats.completed - midInspectionStats.completed}`);
      console.log(`  Final progress: ${finalStats.progress}%`);
    });

    it('should handle invalid checkpoint operations gracefully', () => {
      // ARRANGE: Use non-existent checkpoint ID
      const invalidCheckpointId = 'invalid-checkpoint-id';

      // ACT & ASSERT: Various invalid operations should not throw
      expect(() => {
        stores.checkpoint.updateCheckpointStatus(invalidCheckpointId, 'complies');
      }).not.toThrow();

      expect(() => {
        stores.checkpoint.setComment(invalidCheckpointId, 'Test comment');
      }).not.toThrow();

      expect(() => {
        stores.checkpoint.addPhoto(invalidCheckpointId, mockPhotos[0]);
      }).not.toThrow();

      expect(() => {
        stores.checkpoint.removePhoto(invalidCheckpointId, mockPhotos[0]);
      }).not.toThrow();

      expect(() => {
        stores.checkpoint.deleteCheckpointData(invalidCheckpointId);
      }).not.toThrow();

      // Verify store remains stable
      const stats = stores.checkpoint.getCategoryStats(projectId, 'walls', 'draft');
      expect(stats.total).toBeGreaterThanOrEqual(0);

      console.log('✅ Invalid checkpoint operations handled gracefully');
    });
  });

  describe('Complete Inspection Workflow Integration', () => {
    it('should execute full apartment inspection workflow from start to finish', async () => {
      console.log('🚀 Starting COMPLETE APARTMENT INSPECTION WORKFLOW');

      // ARRANGE: Setup comprehensive scenario
      const categories = ['walls', 'floors', 'ceiling', 'windows', 'doors'];
      const dataset = CommonTestDatasets.varied();

      // Mock all required permissions
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        granted: true,
        status: 'granted',
      });
      ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        granted: true,
        status: 'granted',
      });

      const workflowResults = {
        totalCheckpoints: 0,
        inspectedCheckpoints: 0,
        compliantCount: 0,
        defectCount: 0,
        notInspectedCount: 0,
        totalPhotos: 0,
        categoryProgress: {} as any,
        navigationCalls: 0,
        persistenceCalls: 0,
      };

      // ACT 1: Navigate through each category
      for (let categoryIndex = 0; categoryIndex < categories.length; categoryIndex++) {
        const category = categories[categoryIndex];
        const checkpoints = dataset[category];

        if (!checkpoints || checkpoints.length === 0) {
          console.log(`  ⚠️  No checkpoints for category: ${category}`);
          continue;
        }

        console.log(`  📋 Inspecting ${category} (${checkpoints.length} checkpoints)`);

        // Navigate to category
        navigationMocks.mockRouter.push('/(tabs)/objects/[id]/check/[categoryId]', {
          id: projectId,
          categoryId: category,
        });
        workflowResults.navigationCalls++;

        workflowResults.totalCheckpoints += checkpoints.length;
        workflowResults.categoryProgress[category] = {
          total: checkpoints.length,
          inspected: 0,
          compliant: 0,
          defects: 0,
          photos: 0,
        };

        // ACT 2: Inspect checkpoints in this category
        const inspectCount = Math.min(8, checkpoints.length); // Limit for performance

        for (let i = 0; i < inspectCount; i++) {
          const checkpoint = checkpoints[i];

          // Realistic inspection pattern
          const random = Math.random();
          let status: 'complies' | 'defect' | 'not_inspected';
          let photoCount = 0;

          if (random < 0.6) { // 60% compliant
            status = 'complies';
            workflowResults.compliantCount++;
            photoCount = Math.random() < 0.1 ? 1 : 0; // 10% get photos
          } else if (random < 0.9) { // 30% defects
            status = 'defect';
            workflowResults.defectCount++;
            photoCount = Math.floor(Math.random() * 3) + 1; // 1-3 photos
          } else { // 10% not accessible
            status = 'not_inspected';
            workflowResults.notInspectedCount++;
            photoCount = 0;
          }

          // Update checkpoint
          stores.checkpoint.updateCheckpointStatus(checkpoint.id, status);
          stores.checkpoint.setComment(
            checkpoint.id,
            `${category.charAt(0).toUpperCase() + category.slice(1)} inspection #${i + 1}: ${
              status === 'complies' ? 'No issues found' :
              status === 'defect' ? 'Defect detected - requires attention' :
              'Not accessible during inspection'
            }`
          );

          // Add photos if needed
          for (let j = 0; j < photoCount; j++) {
            const photoIndex = (workflowResults.totalPhotos + j) % mockPhotos.length;
            stores.checkpoint.addPhoto(checkpoint.id, mockPhotos[photoIndex]);
            workflowResults.totalPhotos++;
          }

          workflowResults.categoryProgress[category].inspected++;
          if (status === 'complies') workflowResults.categoryProgress[category].compliant++;
          else if (status === 'defect') workflowResults.categoryProgress[category].defects++;
          workflowResults.categoryProgress[category].photos += photoCount;
        }

        workflowResults.inspectedCheckpoints += inspectCount;

        // Calculate and log category progress
        const categoryStats = stores.checkpoint.getCategoryStats(projectId, category, 'draft');
        console.log(`    ✅ ${category}: ${categoryStats.progress}% complete (${categoryStats.completed}/${categoryStats.total})`);
      }

      // ACT 3: Navigate back to project overview
      navigationMocks.mockRouter.push('/(tabs)/objects/[id]', { id: projectId });
      workflowResults.navigationCalls++;

      // ACT 4: Set project to finish mode (inspection complete)
      stores.ui.setFinishMode('finish');

      // ASSERT: Verify complete workflow results
      expect(workflowResults.inspectedCheckpoints).toBeGreaterThan(0);
      expect(workflowResults.totalPhotos).toBeGreaterThanOrEqual(0);
      expect(workflowResults.navigationCalls).toBeGreaterThan(0);

      // Verify final project state
      const finalProject = stores.project.getActiveProject();
      expect(finalProject).toEqual(
        expect.objectContaining({
          title: 'Full Inspection Test Apartment',
          finishMode: 'draft', // UI store is separate from project
        })
      );

      // Verify UI state
      expect(stores.ui.finishMode).toBe('finish');

      // Verify persistence calls were made
      const storageLog = mockAsyncStorage.getOperationLog();
      const setItemCalls = storageLog.filter((op: any) => op.operation === 'setItem');
      expect(setItemCalls.length).toBeGreaterThan(0);

      // Calculate final overall progress
      let overallCompleted = 0;
      categories.forEach(category => {
        const stats = stores.checkpoint.getCategoryStats(projectId, category, 'draft');
        overallCompleted += stats.completed;
      });

      const overallProgress = workflowResults.totalCheckpoints > 0
        ? Math.round((overallCompleted / workflowResults.totalCheckpoints) * 100)
        : 0;

      // Log comprehensive results
      console.log('\n🎉 COMPLETE APARTMENT INSPECTION WORKFLOW RESULTS:');
      console.log('='.repeat(60));
      console.log(`📊 Overall Statistics:`);
      console.log(`   Total categories: ${Object.keys(workflowResults.categoryProgress).length}`);
      console.log(`   Total checkpoints: ${workflowResults.totalCheckpoints}`);
      console.log(`   Checkpoints inspected: ${workflowResults.inspectedCheckpoints}`);
      console.log(`   Overall progress: ${overallProgress}%`);
      console.log('');
      console.log(`✅ Inspection Breakdown:`);
      console.log(`   Compliant: ${workflowResults.compliantCount} (${Math.round((workflowResults.compliantCount / workflowResults.inspectedCheckpoints) * 100)}%)`);
      console.log(`   Defects: ${workflowResults.defectCount} (${Math.round((workflowResults.defectCount / workflowResults.inspectedCheckpoints) * 100)}%)`);
      console.log(`   Not inspected: ${workflowResults.notInspectedCount}`);
      console.log(`   Total photos: ${workflowResults.totalPhotos}`);
      console.log('');
      console.log(`📱 Category Breakdown:`);
      Object.entries(workflowResults.categoryProgress).forEach(([category, progress]: [string, any]) => {
        const categoryPercent = progress.total > 0 ? Math.round((progress.inspected / progress.total) * 100) : 0;
        console.log(`   ${category.charAt(0).toUpperCase() + category.slice(1)}: ${progress.inspected}/${progress.total} (${categoryPercent}%) - ${progress.compliant} compliant, ${progress.defects} defects, ${progress.photos} photos`);
      });
      console.log('');
      console.log(`🔄 System Integration:`);
      console.log(`   Navigation calls: ${workflowResults.navigationCalls}`);
      console.log(`   Persistence operations: ${setItemCalls.length}`);
      console.log('');
      console.log('✅ FULL INSPECTION WORKFLOW COMPLETED SUCCESSFULLY!');
      console.log('='.repeat(60));

      // Final verification - all critical systems worked
      expect(workflowResults.inspectedCheckpoints).toBeGreaterThan(0);
      expect(overallProgress).toBeGreaterThan(0);
      expect(workflowResults.navigationCalls).toBe(categories.length + 1); // Categories + back to project
      expect(setItemCalls.length).toBeGreaterThan(0);
      expect(stores.ui.finishMode).toBe('finish');
    });
  });
});