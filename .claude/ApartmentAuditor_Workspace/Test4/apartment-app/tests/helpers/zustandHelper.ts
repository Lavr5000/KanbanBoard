/**
 * Zustand Test Helper
 *
 * Helper functions to reset Zustand stores between tests
 */

import { useProjectStore } from '../../services/store/projectStore';
import { useUIStore } from '../../services/store/uiStore';
import { useCheckpointStore } from '../../services/store/checkpointStore';

/**
 * Reset all Zustand stores to initial state
 * This should be called in beforeEach to ensure test isolation
 */
export const resetAllStores = (): void => {
  // Reset project store
  useProjectStore.setState({
    projects: [],
    activeProjectId: null,
  });

  // Reset UI store
  useUIStore.setState({
    finishMode: 'draft',
    activeTab: 'objects',
    isLoading: false,
    themeMode: 'dark',
  });

  // Reset checkpoint store
  useCheckpointStore.setState({
    changes: {},
    projectId: null,
  });

  // Clear any persisted data from mocks
  jest.clearAllMocks();
};

/**
 * Get a clean state for a specific store
 */
export const getCleanProjectStore = () => useProjectStore.getState();
export const getCleanUIStore = () => useUIStore.getState();
export const getCleanCheckpointStore = () => useCheckpointStore.getState();