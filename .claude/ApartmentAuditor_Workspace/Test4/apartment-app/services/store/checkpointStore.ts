import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  CheckpointChanges,
  CheckpointStatus,
  DBCheckpoint,
  FinishMode
} from '../types/index';
import checkpointsDB from '../../constants/checkpoints_v2.1.json';

// Type for the imported JSON
type CheckpointsDatabase = typeof checkpointsDB;

interface CheckpointStore {
  // State
  changes: CheckpointChanges;
  projectId: string | null;

  // Actions for individual checkpoints
  updateCheckpointStatus: (
    checkpointId: string,
    status: CheckpointStatus
  ) => void;
  addPhoto: (checkpointId: string, uri: string) => void;
  removePhoto: (checkpointId: string, uri: string) => void;
  setComment: (checkpointId: string, comment: string) => void;
  setRoom: (checkpointId: string, room: string) => void;
  deleteCheckpointData: (checkpointId: string) => void;

  // Actions for project scope
  setProjectId: (projectId: string | null) => void;
  setProjectChanges: (projectId: string, changes: { [checkpointId: string]: { status?: CheckpointStatus; userPhotos?: string[]; userComment?: string; timestamp?: number; } }) => void;
  clearAllChanges: () => void;

  // AppFlowy Projection Methods
  getCheckpointState: (checkpointId: string) => DBCheckpoint;
  getCategoryCheckpoints: (
    categoryId: string,
    finishMode: FinishMode
  ) => DBCheckpoint[];
  getCategoryStats: (projectId: string, categoryId: string, finishMode: FinishMode) => {
    total: number;
    inspected: number;
    percentage: number;
  };
  getProjectChanges: () => { [checkpointId: string]: { status?: CheckpointStatus; userPhotos?: string[]; userComment?: string; timestamp?: number; } };

  // Batch operations for performance
  updateMultipleCheckpoints: (updates: {
    checkpointId: string;
    status?: CheckpointStatus;
    userPhotos?: string[];
    userComment?: string;
  }[]) => void;
}

// Helper to safely get checkpoint from database
const getCheckpointFromDB = (checkpointId: string): DBCheckpoint | null => {
  // Search all categories for the checkpoint
  for (const category of Object.values(checkpointsDB.categories)) {
    for (const mode of ['draft', 'finish'] as const) {
      const checkpoint = category[mode].find(cp => cp.id === checkpointId);
      if (checkpoint) return checkpoint;
    }
  }
  return null;
};


// Helper to get all checkpoints in a category
const getCheckpointsByCategory = (
  categoryId: string,
  finishMode: FinishMode
): DBCheckpoint[] => {
  // Use type assertion to handle category access
  const category = checkpointsDB.categories[categoryId as keyof typeof checkpointsDB.categories];
  return category ? category[finishMode] : [];
};

// Helper to merge base checkpoint with changes
const mergeCheckpointWithChanges = (
  baseCheckpoint: DBCheckpoint,
  changes: CheckpointChanges,
  projectId: string
): DBCheckpoint => {
  const projectChanges = changes[projectId] || {};
  const checkpointChanges = projectChanges[baseCheckpoint.id];

  if (!checkpointChanges) {
    return {
      ...baseCheckpoint,
      status: baseCheckpoint.status || null
    };
  }

  return {
    ...baseCheckpoint,
    status: checkpointChanges.status ?? baseCheckpoint.status ?? null,
    userPhotos: checkpointChanges.userPhotos ?? baseCheckpoint.userPhotos,
    userComment: checkpointChanges.userComment ?? baseCheckpoint.userComment,
    selectedRoom: checkpointChanges.selectedRoom ?? baseCheckpoint.selectedRoom
  };
};

export const useCheckpointStore = create<CheckpointStore>()(
  persist(
    (set, get) => ({
      // Initial state
      changes: {},
      projectId: null,

      // Individual checkpoint actions
      updateCheckpointStatus: (checkpointId: string, status: CheckpointStatus) => {
        const state = get();
        const projectId = state.projectId;
        if (!projectId) return;

        set((prev: CheckpointStore) => ({
          changes: {
            ...prev.changes,
            [projectId]: {
              ...(prev.changes[projectId] || {}),
              [checkpointId]: {
                ...((prev.changes[projectId] || {})[checkpointId] || {}),
                status,
                timestamp: Date.now()
              }
            }
          }
        }));
      },

      addPhoto: (checkpointId: string, uri: string) => {
        const state = get();
        const projectId = state.projectId;
        if (!projectId) return;

        set((prev: CheckpointStore) => ({
          changes: {
            ...prev.changes,
            [projectId]: {
              ...(prev.changes[projectId] || {}),
              [checkpointId]: {
                ...((prev.changes[projectId] || {})[checkpointId] || {}),
                userPhotos: [
                  ...((prev.changes[projectId] || {})[checkpointId]?.userPhotos || []),
                  uri
                ],
                timestamp: Date.now()
              }
            }
          }
        }));
      },

      removePhoto: (checkpointId: string, uri: string) => {
        const state = get();
        const projectId = state.projectId;
        if (!projectId) return;

        set((prev: CheckpointStore) => ({
          changes: {
            ...prev.changes,
            [projectId]: {
              ...(prev.changes[projectId] || {}),
              [checkpointId]: {
                ...((prev.changes[projectId] || {})[checkpointId] || {}),
                userPhotos: (
                  (prev.changes[projectId] || {})[checkpointId]?.userPhotos || []
                ).filter((photoUri: string) => photoUri !== uri),
                timestamp: Date.now()
              }
            }
          }
        }));
      },

      setComment: (checkpointId: string, comment: string) => {
        const state = get();
        const projectId = state.projectId;
        if (!projectId) return;

        set((prev: CheckpointStore) => ({
          changes: {
            ...prev.changes,
            [projectId]: {
              ...(prev.changes[projectId] || {}),
              [checkpointId]: {
                ...((prev.changes[projectId] || {})[checkpointId] || {}),
                userComment: comment,
                timestamp: Date.now()
              }
            }
          }
        }));
      },

      setRoom: (checkpointId: string, room: string) => {
        const state = get();
        const projectId = state.projectId;
        if (!projectId) return;

        set((prev: CheckpointStore) => ({
          changes: {
            ...prev.changes,
            [projectId]: {
              ...(prev.changes[projectId] || {}),
              [checkpointId]: {
                ...((prev.changes[projectId] || {})[checkpointId] || {}),
                selectedRoom: room,
                timestamp: Date.now()
              }
            }
          }
        }));
      },

      deleteCheckpointData: (checkpointId: string) => {
        const state = get();
        const projectId = state.projectId;
        if (!projectId) return;

        set((prev: CheckpointStore) => {
          const projectChanges = prev.changes[projectId] || {};
          const newCheckpointChanges = { ...projectChanges };
          delete newCheckpointChanges[checkpointId];

          return {
            changes: {
              ...prev.changes,
              [projectId]: Object.keys(newCheckpointChanges).length > 0
                ? newCheckpointChanges
                : undefined
            }
          };
        });
      },

      // Project scope actions
      setProjectId: (projectId: string | null) => set({ projectId }),

      setProjectChanges: (projectId: string, changes: { [checkpointId: string]: { status?: CheckpointStatus; userPhotos?: string[]; userComment?: string; timestamp?: number; } }) => {
        set((prev: CheckpointStore) => ({
          changes: {
            ...prev.changes,
            [projectId]: changes
          },
          projectId
        }));
      },

      clearAllChanges: () => set({ changes: {}, projectId: null }),

      // AppFlowy Projection Methods
      getCheckpointState: (checkpointId: string) => {
        const state = get();
        const baseCheckpoint = getCheckpointFromDB(checkpointId);

        if (!baseCheckpoint) {
          throw new Error(`Checkpoint with ID "${checkpointId}" not found in database`);
        }

        return mergeCheckpointWithChanges(baseCheckpoint, state.changes, state.projectId || '');
      },

      getCategoryCheckpoints: (categoryId: string, finishMode: FinishMode) => {
        const state = get();
        const baseCheckpoints = getCheckpointsByCategory(categoryId, finishMode);

        return baseCheckpoints.map(checkpoint =>
          mergeCheckpointWithChanges(checkpoint, state.changes, state.projectId || '')
        );
      },

      getCategoryStats: (projectId: string, categoryId: string, finishMode: FinishMode) => {
        const state = get();
        const baseCheckpoints = getCheckpointsByCategory(categoryId, finishMode);
        const projectChanges = state.changes[projectId || ''] || {};

        let inspected = 0;

        baseCheckpoints.forEach(checkpoint => {
          const checkpointChanges = projectChanges[checkpoint.id];
          if (
            checkpointChanges?.status !== undefined &&
            checkpointChanges?.status !== null &&
            checkpointChanges?.status !== 'not_inspected'
          ) {
            inspected++;
          }
        });

        return {
          total: baseCheckpoints.length,
          inspected,
          percentage: baseCheckpoints.length > 0
            ? Math.round((inspected / baseCheckpoints.length) * 100)
            : 0
        };
      },

      getProjectChanges: () => {
        const state = get();
        const projectId = state.projectId;
        if (!projectId) return {};
        return state.changes[projectId] || {};
      },

      // Batch operations for performance
      updateMultipleCheckpoints: (updates: {
        checkpointId: string;
        status?: CheckpointStatus;
        userPhotos?: string[];
        userComment?: string;
      }[]) => {
        const state = get();
        const projectId = state.projectId;

        if (!projectId) return;

        set((prev: CheckpointStore) => {
          const projectChanges = prev.changes[projectId] || {};
          const newCheckpointChanges = { ...projectChanges };

          updates.forEach((update: {
            checkpointId: string;
            status?: CheckpointStatus;
            userPhotos?: string[];
            userComment?: string;
          }) => {
            if (!newCheckpointChanges[update.checkpointId]) {
              newCheckpointChanges[update.checkpointId] = {};
            }

            if (update.status !== undefined) {
              newCheckpointChanges[update.checkpointId].status = update.status;
            }

            if (update.userPhotos !== undefined) {
              newCheckpointChanges[update.checkpointId].userPhotos = update.userPhotos;
            }

            if (update.userComment !== undefined) {
              newCheckpointChanges[update.checkpointId].userComment = update.userComment;
            }

            newCheckpointChanges[update.checkpointId].timestamp = Date.now();
          });

          return {
            changes: {
              ...prev.changes,
              [projectId]: Object.keys(newCheckpointChanges).length > 0
                ? newCheckpointChanges
                : undefined
            }
          };
        });
      }
    }),
    {
      name: 'checkpoint-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        changes: state.changes
        // projectId is not persisted as it's session-based
      })
    }
  )
);

// Selectors for performance optimization
export const selectCheckpointState = (checkpointId: string) => (state: CheckpointStore) =>
  state.getCheckpointState(checkpointId);

export const selectCategoryCheckpoints = (categoryId: string, finishMode: FinishMode) =>
  (state: CheckpointStore) => state.getCategoryCheckpoints(categoryId, finishMode);

export const selectCategoryStats = (projectId: string, categoryId: string, finishMode: FinishMode) => (state: CheckpointStore) =>
  state.getCategoryStats(projectId, categoryId, finishMode);

export const selectProjectChanges = (state: CheckpointStore) => state.getProjectChanges();

// Utility functions
export const checkpointUtils = {
  getCheckpointFromDB,
  getCheckpointsByCategory,
  mergeCheckpointWithChanges
};