// Centralized exports for all Zustand stores
import { useUIStore, useUIStoreWithPersistence, selectFinishMode, selectActiveTab, selectIsLoading } from './uiStore';
import { useProjectStore, selectProjects, selectActiveProject, selectActiveProjectId, selectActiveProjectIndex, projectUtils } from './projectStore';
import {
  useCheckpointStore,
  selectCheckpointState,
  selectCategoryCheckpoints,
  selectCategoryStats,
  selectProjectChanges,
  checkpointUtils
} from './checkpointStore';

// Main store hooks
export {
  useUIStore,
  useUIStoreWithPersistence,
  useProjectStore,
  useCheckpointStore
};

// UI Store exports
export const uiStore = {
  use: useUIStore,
  useWithPersistence: useUIStoreWithPersistence,
  selectors: {
    selectFinishMode,
    selectActiveTab,
    selectIsLoading
  }
};

// Project Store exports
export const projectStore = {
  use: useProjectStore,
  selectors: {
    selectProjects,
    selectActiveProject,
    selectActiveProjectId,
    selectActiveProjectIndex
  },
  utils: projectUtils
};

// Checkpoint Store exports
export const checkpointStore = {
  use: useCheckpointStore,
  selectors: {
    selectCheckpointState,
    selectCategoryCheckpoints,
    selectCategoryStats,
    selectProjectChanges
  },
  utils: checkpointUtils
};

// Combined store setup for root provider
export const stores = {
  ui: useUIStore,
  project: useProjectStore,
  checkpoint: useCheckpointStore
};

// Type exports
export type {
  UIState,
  Project,
  CheckpointChanges,
  CheckpointStatus,
  FinishMode,
  DBCheckpoint,
  Category,
  CheckpointsDatabase,
  ProjectCheckpoint,
  ProgressResult,
  CategoryInfo
} from '../types/index';

// Convenience hook for getting all stores at once
export const useAllStores = () => ({
  ui: useUIStore(),
  project: useProjectStore(),
  checkpoint: useCheckpointStore()
});

// Store initialization utility
export const initializeStores = async () => {
  // This can be used for any async initialization if needed
  // For now, it's a placeholder for future extensibility
  console.log('Stores initialized');
};

// Store debugging helpers
export const storeUtils = {
  // Get current store states for debugging
  getState: () => ({
    ui: useUIStore.getState(),
    project: useProjectStore.getState(),
    checkpoint: useCheckpointStore.getState()
  }),

  // Subscribe to specific store changes
  subscribeToProjectChanges: (callback: (state: any) => void) => {
    return useProjectStore.subscribe(callback);
  },

  subscribeToCheckpointChanges: (callback: (state: any) => void) => {
    return useCheckpointStore.subscribe(callback);
  }
};