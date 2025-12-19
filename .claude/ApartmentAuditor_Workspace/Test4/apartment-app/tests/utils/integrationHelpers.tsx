/**
 * Integration Test Helpers
 *
 * Common utilities and patterns for integration testing of workflows.
 * Consolidates helpers from integration directory for easier imports.
 */

import { render, RenderResult } from '@testing-library/react-native';
import { resetAllStores } from '../helpers/zustandHelper';
import { setupAsyncStorageMock } from '../integration/helpers/AsyncStorageMock';
import { setupNavigationMocks } from '../integration/helpers/navigationMock';
import { renderWithProviders } from '../integration/helpers/testProviders';
import { CommonTestDatasets } from '../integration/helpers/checkpointsLoader';
import { useProjectStore, useCheckpointStore, useUIStore } from '../services/store';

/**
 * Setup integration test environment
 * Resets stores, mocks, and prepares test context
 */
export const setupIntegrationTest = (
  navigationPath: string = '/',
  navigationParams: any = {},
  initialStorageState: any = {}
) => {
  // Reset all Zustand stores
  resetAllStores();

  // Setup AsyncStorage mock with initial state
  const asyncStorageMock = setupAsyncStorageMock(initialStorageState);

  // Setup navigation mocks
  const navigationMocks = setupNavigationMocks(navigationPath, navigationParams);

  // Return stores for direct access in tests
  const stores = {
    project: useProjectStore.getState(),
    checkpoint: useCheckpointStore.getState(),
    ui: useUIStore.getState(),
  };

  return {
    asyncStorageMock,
    navigationMocks,
    stores,
  };
};

/**
 * Render component with full integration test setup
 */
export const renderForIntegration = (
  component: React.ReactElement,
  options: {
    navigationPath?: string;
    navigationParams?: any;
    initialStorageState?: any;
    initialStoreState?: any;
  } = {}
): RenderResult & {
  asyncStorageMock: any;
  navigationMocks: any;
  stores: any;
} => {
  // Setup test environment
  const {
    asyncStorageMock,
    navigationMocks,
    stores,
  } = setupIntegrationTest(
    options.navigationPath,
    options.navigationParams,
    options.initialStorageState
  );

  // Render component with providers
  const renderResult = renderWithProviders(component, {
    initialStoreState: options.initialStoreState,
  });

  return {
    ...renderResult,
    asyncStorageMock,
    navigationMocks,
    stores,
  };
};

/**
 * Common test data factories
 */
export const TestDataFactories = {
  /**
   * Create test project with standard structure
   */
  createProject: (overrides: any = {}) => ({
    id: `project-${Date.now()}`,
    title: 'Test Apartment Project',
    address: '123 Test Street',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    finishMode: 'draft' as const,
    isActive: true,
    isArchived: false,
    participants: [],
    ...overrides,
  }),

  /**
   * Create test participant
   */
  createParticipant: (overrides: any = {}) => ({
    id: `participant-${Date.now()}`,
    name: 'Test Inspector',
    role: 'Inspector',
    contact: 'test@example.com',
    ...overrides,
  }),

  /**
   * Create checkpoint update data
   */
  createCheckpointUpdate: (overrides: any = {}) => ({
    status: 'complies' as const,
    userComment: 'Test comment',
    userPhotos: ['file://test-photo.jpg'],
    ...overrides,
  }),

  /**
   * Get standard test dataset
   */
  getStandardCheckpoints: () => CommonTestDatasets.standard(),
};

/**
 * Workflow assertion helpers
 */
export const WorkflowAssertions = {
  /**
   * Assert project was created and persisted
   */
  expectProjectCreated: (
    stores: any,
    asyncStorageMock: any,
    expectedProject: any
  ) => {
    // Check store state
    const project = stores.project.projects.find(
      (p: any) => p.id === expectedProject.id
    );
    expect(project).toEqual(expect.objectContaining(expectedProject));

    // Check persistence
    asyncStorageMock.expectOperation(
      'setItem',
      expect.stringContaining('project-store'),
      expect.any(String)
    );
  },

  /**
   * Assert navigation sequence for workflow
   */
  expectNavigationSequence: (
    navigationMocks: any,
    expectedSequence: Array<{
      method: string;
      pathname?: string;
      params?: any;
    }>
  ) => {
    navigationMocks.tracker.expectNavigationSequence(expectedSequence);
  },

  /**
   * Assert checkpoint updates were saved
   */
  expectCheckpointUpdates: (
    stores: any,
    asyncStorageMock: any,
    projectId: string,
    expectedUpdates: any[]
  ) => {
    // Check store state
    expect(stores.checkpoint.projectId).toBe(projectId);

    expectedUpdates.forEach(({ checkpointId, expectedUpdate }) => {
      const checkpointState = stores.checkpoint.getCheckpointState(checkpointId);
      expect(checkpointState).toEqual(expect.objectContaining(expectedUpdate));
    });

    // Check persistence
    asyncStorageMock.expectOperation(
      'setItem',
      expect.stringContaining('checkpoint-store'),
      expect.any(String)
    );
  },

  /**
   * Assert category progress calculation
   */
  expectCategoryProgress: (
    stores: any,
    projectId: string,
    categoryId: string,
    finishMode: 'draft' | 'finish',
    expectedProgress: number
  ) => {
    const stats = stores.checkpoint.getCategoryStats(
      projectId,
      categoryId,
      finishMode
    );
    expect(stats.progress).toBe(expectedProgress);
  },
};

/**
 * Create test scenarios for common workflows
 */
export const TestScenarios = {
  /**
   * Setup scenario for project creation workflow
   */
  projectCreation: () => {
    return setupIntegrationTest('/(tabs)/objects');
  },

  /**
   * Setup scenario for inspection workflow
   */
  inspection: (projectId: string = 'test-project-id') => {
    // Create initial project
    const initialProject = TestDataFactories.createProject({
      id: projectId,
    });

    const initialStorage = {
      'project-store': JSON.stringify({
        state: {
          projects: [initialProject],
          activeProjectId: projectId,
        },
        version: 0,
      }),
    };

    return setupIntegrationTest(
      '/(tabs)/objects/[id]',
      { id: projectId },
      initialStorage
    );
  },

  /**
   * Setup scenario with existing checkpoints
   */
  withCheckpoints: (
    projectId: string = 'test-project-id',
    categoryId: string = 'walls'
  ) => {
    const scenario = TestScenarios.inspection(projectId);

    // Load test checkpoints
    const checkpoints = CommonTestDatasets.standard()[categoryId];

    // Set up checkpoint store with test data
    const { stores } = scenario;
    stores.checkpoint.setProjectId(projectId);

    return {
      ...scenario,
      testCheckpoints: checkpoints,
    };
  },
};

/**
 * Cleanup utilities
 */
export const CleanupUtils = {
  /**
   * Clean up integration test after each test
   */
  cleanup: () => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    resetAllStores();
  },

  /**
   * Clean up with additional custom cleanup
   */
  cleanupWith: (additionalCleanup: () => void) => {
    additionalCleanup();
    CleanupUtils.cleanup();
  },
};

export default {
  setupIntegrationTest,
  renderForIntegration,
  TestDataFactories,
  WorkflowAssertions,
  TestScenarios,
  CleanupUtils,
};