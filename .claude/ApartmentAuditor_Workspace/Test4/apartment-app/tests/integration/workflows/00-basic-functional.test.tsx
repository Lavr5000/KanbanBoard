/**
 * Basic Functional Integration Test
 *
 * Tests basic store functionality without state reset
 */

import { useProjectStore, useCheckpointStore, useUIStore } from '../../../services/store';

describe('Basic Functional Integration Test', () => {
  it('should test project store functionality', () => {
    // Get fresh store state
    const projectStore = useProjectStore.getState();

    // Create project
    const projectId = projectStore.createProject('Test Project', 'Test Address');
    expect(projectId).toBeDefined();

    // Set as active
    projectStore.setActiveProject(projectId);
    expect(projectStore.activeProjectId).toBe(projectId);

    // Update with participants
    const participants = [{
      role: 'inspector' as const,
      fullName: 'Test Inspector',
      position: 'Position',
      organization: 'Organization',
    }];

    projectStore.updateProject(projectId, { participants });

    // Verify updates
    const updatedProject = projectStore.projects.find(p => p.id === projectId);
    expect(updatedProject?.participants).toHaveLength(1);

    console.log('✅ Project store test passed');
  });

  it('should test checkpoint store functionality', () => {
    // Get stores
    const projectStore = useProjectStore.getState();
    const checkpointStore = useCheckpointStore.getState();

    // Create project for context
    const projectId = projectStore.createProject('Checkpoint Test');
    checkpointStore.setProjectId(projectId);

    // Update checkpoint
    const checkpointId = 'test-cp-1';
    checkpointStore.updateCheckpointStatus(checkpointId, 'complies');
    checkpointStore.setComment(checkpointId, 'Test comment');

    // Verify state
    const state = checkpointStore.getCheckpointState(checkpointId);
    expect(state.status).toBe('complies');
    expect(state.userComment).toBe('Test comment');

    // Add photo
    checkpointStore.addPhoto(checkpointId, 'file://test.jpg');
    const photoState = checkpointStore.getCheckpointState(checkpointId);
    expect(photoState.userPhotos).toContain('file://test.jpg');

    console.log('✅ Checkpoint store test passed');
  });

  it('should test UI store functionality', () => {
    // Get UI store
    const uiStore = useUIStore.getState();

    // Change states
    uiStore.setFinishMode('finish');
    uiStore.setActiveTab('services');
    uiStore.setLoading(true);

    // Verify changes
    expect(uiStore.finishMode).toBe('finish');
    expect(uiStore.activeTab).toBe('services');
    expect(uiStore.isLoading).toBe(true);

    // Toggle mode
    uiStore.toggleFinishMode();
    expect(uiStore.finishMode).toBe('draft');

    console.log('✅ UI store test passed');
  });

  it('should test store integration workflow', () => {
    // Get all stores
    const projectStore = useProjectStore.getState();
    const checkpointStore = useCheckpointStore.getState();
    const uiStore = useUIStore.getState();

    // Create project and setup context
    const projectId = projectStore.createProject('Integration Test');
    projectStore.setActiveProject(projectId);
    checkpointStore.setProjectId(projectId);
    uiStore.setFinishMode('draft');

    // Simulate inspection
    const checkpoints = ['cp1', 'cp2'];
    checkpoints.forEach(cpId => {
      checkpointStore.updateCheckpointStatus(cpId, 'complies');
      checkpointStore.setComment(cpId, `Comment for ${cpId}`);
    });

    // Switch to finish mode
    uiStore.setFinishMode('finish');

    // Verify workflow
    expect(projectStore.activeProjectId).toBe(projectId);
    expect(checkpointStore.projectId).toBe(projectId);
    expect(uiStore.finishMode).toBe('finish');

    // Verify checkpoint data
    const cp1State = checkpointStore.getCheckpointState('cp1');
    expect(cp1State.status).toBe('complies');
    expect(cp1State.userComment).toBe('Comment for cp1');

    console.log('✅ Store integration test passed');
    console.log(`  Created project with ID: ${projectId}`);
    console.log(`  Processed ${checkpoints.length} checkpoints`);
    console.log(`  Final UI mode: ${uiStore.finishMode}`);
  });
});