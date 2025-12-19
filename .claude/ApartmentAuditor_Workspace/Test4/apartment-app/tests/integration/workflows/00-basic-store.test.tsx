/**
 * Basic Store Integration Test
 *
 * Tests basic store functionality without complex dependencies
 */

import { resetAllStores } from '../../helpers/zustandHelper';
import { useProjectStore, useCheckpointStore, useUIStore } from '../../../services/store';
import { TestDataFactories } from '../../utils/integrationHelpers';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  multiSet: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  clear: jest.fn(() => Promise.resolve()),
}));

describe('Basic Store Integration', () => {
  beforeEach(() => {
    resetAllStores();
    jest.clearAllMocks();
  });

  it('should create and manage projects through store', () => {
    // ARRANGE: Get stores
    const projectStore = useProjectStore.getState();
    const checkpointStore = useCheckpointStore.getState();
    const uiStore = useUIStore.getState();

    // ACT: Create project
    const testProject = TestDataFactories.createProject({
      title: 'Basic Test Project',
      address: '123 Test Street',
    });

    const projectId = projectStore.createProject(testProject.title, testProject.address);

    // ASSERT: Verify project creation
    expect(projectId).toBeDefined();
    expect(projectId).toBeTypeOf('string');

    const createdProject = projectStore.projects.find((p: any) => p.id === projectId);
    expect(createdProject).toEqual(
      expect.objectContaining({
        id: projectId,
        title: 'Basic Test Project',
        address: '123 Test Street',
        isActive: true,
        isArchived: false,
        finishMode: 'draft',
      })
    );

    // ACT: Set as active project
    projectStore.setActiveProject(projectId);

    // ASSERT: Verify active project
    expect(projectStore.activeProjectId).toBe(projectId);
    expect(projectStore.getActiveProject()).toEqual(createdProject);

    // ACT: Update project with participants
    const participants = [
      TestDataFactories.createParticipant({
        role: 'inspector',
        fullName: 'Test Inspector',
      }),
    ];

    projectStore.updateProject(projectId, { participants });

    // ASSERT: Verify participants added
    const updatedProject = projectStore.getProject(projectId);
    expect(updatedProject.participants).toHaveLength(1);
    expect(updatedProject.participants[0]).toEqual(
      expect.objectContaining({
        role: 'inspector',
        fullName: 'Test Inspector',
      })
    );

    console.log('✅ Basic store functionality test passed');
    console.log(`  Created project: ${createdProject.title}`);
    console.log(`  Project ID: ${projectId}`);
    console.log(`  Participants: ${updatedProject.participants.length}`);
  });

  it('should manage checkpoints through store', () => {
    // ARRANGE: Get stores and create project
    const projectStore = useProjectStore.getState();
    const checkpointStore = useCheckpointStore.getState();

    const projectId = projectStore.createProject('Checkpoint Test Project');

    // ACT: Set checkpoint project context
    checkpointStore.setProjectId(projectId);

    // ASSERT: Verify project context
    expect(checkpointStore.projectId).toBe(projectId);

    // ACT: Update checkpoint status
    const checkpointId = 'test-checkpoint-1';
    checkpointStore.updateCheckpointStatus(checkpointId, 'complies');
    checkpointStore.setComment(checkpointId, 'Test comment');

    // ASSERT: Verify checkpoint updates
    const checkpointState = checkpointStore.getCheckpointState(checkpointId);
    expect(checkpointState.status).toBe('complies');
    expect(checkpointState.userComment).toBe('Test comment');

    // ACT: Add photos
    const photos = ['file://test-photo-1.jpg', 'file://test-photo-2.jpg'];
    photos.forEach(photo => checkpointStore.addPhoto(checkpointId, photo));

    // ASSERT: Verify photos added
    const updatedState = checkpointStore.getCheckpointState(checkpointId);
    expect(updatedState.userPhotos).toHaveLength(2);
    expect(updatedState.userPhotos).toEqual(photos);

    // ACT: Remove photo
    checkpointStore.removePhoto(checkpointId, photos[0]);

    // ASSERT: Verify photo removed
    const finalState = checkpointStore.getCheckpointState(checkpointId);
    expect(finalState.userPhotos).toHaveLength(1);
    expect(finalState.userPhotos[0]).toBe(photos[1]);

    console.log('✅ Checkpoint store functionality test passed');
    console.log(`  Checkpoint ID: ${checkpointId}`);
    console.log(`  Status: ${finalState.status}`);
    console.log(`  Photos: ${finalState.userPhotos.length}`);
  });

  it('should manage UI state through store', () => {
    // ARRANGE: Get UI store
    const uiStore = useUIStore.getState();

    // ASSERT: Verify initial state
    expect(uiStore.finishMode).toBe('draft');
    expect(uiStore.activeTab).toBe('objects');
    expect(uiStore.isLoading).toBe(false);

    // ACT: Change finish mode
    uiStore.setFinishMode('finish');

    // ASSERT: Verify mode change
    expect(uiStore.finishMode).toBe('finish');

    // ACT: Toggle finish mode
    uiStore.toggleFinishMode();

    // ASSERT: Verify toggle
    expect(uiStore.finishMode).toBe('draft');

    // ACT: Change active tab
    uiStore.setActiveTab('services');

    // ASSERT: Verify tab change
    expect(uiStore.activeTab).toBe('services');

    // ACT: Set loading state
    uiStore.setLoading(true);

    // ASSERT: Verify loading state
    expect(uiStore.isLoading).toBe(true);

    console.log('✅ UI store functionality test passed');
    console.log(`  Finish mode: ${uiStore.finishMode}`);
    console.log(`  Active tab: ${uiStore.activeTab}`);
    console.log(`  Loading: ${uiStore.isLoading}`);
  });

  it('should handle store interactions correctly', () => {
    // ARRANGE: Get all stores
    const projectStore = useProjectStore.getState();
    const checkpointStore = useCheckpointStore.getState();
    const uiStore = useUIStore.getState();

    // ACT: Create comprehensive test scenario
    const projectId = projectStore.createProject('Store Integration Test');
    projectStore.setActiveProject(projectId);

    checkpointStore.setProjectId(projectId);
    uiStore.setFinishMode('draft');

    // Add multiple checkpoints with different statuses
    const checkpoints = ['cp-1', 'cp-2', 'cp-3'];
    checkpoints.forEach((cpId, index) => {
      const status = index % 2 === 0 ? 'complies' : 'defect';
      checkpointStore.updateCheckpointStatus(cpId, status);
      checkpointStore.setComment(cpId, `Comment for ${cpId}`);
    });

    // Switch to finish mode
    uiStore.setFinishMode('finish');

    // Archive project
    projectStore.archiveProject(projectId);

    // ASSERT: Verify complete state
    expect(projectStore.projects[0].isArchived).toBe(true);
    expect(uiStore.finishMode).toBe('finish');
    expect(checkpointStore.getCheckpointState('cp-1').status).toBe('complies');
    expect(checkpointStore.getCheckpointState('cp-2').status).toBe('defect');

    console.log('✅ Store integration test passed');
    console.log(`  Project archived: ${projectStore.projects[0].isArchived}`);
    console.log(`  UI mode: ${uiStore.finishMode}`);
    console.log(`  Checkpoints updated: ${checkpoints.length}`);
  });
});