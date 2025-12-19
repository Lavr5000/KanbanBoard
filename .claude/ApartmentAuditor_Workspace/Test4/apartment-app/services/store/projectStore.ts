import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Project } from '../types/index';

interface ProjectStore {
  // State
  projects: Project[];
  activeProjectId: string | null;

  // Actions
  createProject: (title: string, address?: string) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;
  getActiveProject: () => Project | null;
  getAllProjects: () => Project[];
  getActiveProjectIndex: () => number;
}

// Helper function to generate simple timestamp-based ID
const generateProjectId = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `project_${timestamp}_${random}`;
};

// Helper function to validate project object
const validateProject = (project: unknown): project is Project => {
  if (typeof project !== 'object' || project === null) return false;

  const p = project as Project;
  return (
    typeof p.id === 'string' &&
    typeof p.title === 'string' &&
    (p.address === undefined || typeof p.address === 'string') && // Address is optional
    typeof p.createdAt === 'number' &&
    typeof p.updatedAt === 'number' &&
    typeof p.isActive === 'boolean' &&
    (p.finishMode === 'draft' || p.finishMode === 'finish')
  );
};

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      // Initial state
      projects: [],
      activeProjectId: null,

      // Actions
      createProject: (title: string, address?: string) => {
        const projectId = generateProjectId();
        const now = Date.now();

        const newProject: Project = {
          id: projectId,
          title,
          address: address || '', // Default to empty string if not provided
          createdAt: now,
          updatedAt: now,
          isActive: true,
          finishMode: 'draft'
        };

        set(state => ({
          projects: [...state.projects, newProject],
          activeProjectId: projectId
        }));

        return projectId;
      },

      updateProject: (id: string, updates: Partial<Project>) => {
        set(state => ({
          projects: state.projects.map(project =>
            project.id === id
              ? { ...project, ...updates, updatedAt: Date.now() }
              : project
          )
        }));
      },

      deleteProject: (id: string) => {
        set(state => ({
          projects: state.projects
            .filter(project => project.id !== id)
            .map(project => ({
              ...project,
              isActive: project.id === state.activeProjectId ? false : project.isActive
            })),
          activeProjectId: state.activeProjectId === id ? null : state.activeProjectId
        }));
      },

      setActiveProject: (id: string | null) => {
        set(state => ({
          activeProjectId: id
        }));
      },

      getActiveProject: () => {
        const state = get();
        return state.projects.find(p => p.id === state.activeProjectId) || null;
      },

      getAllProjects: () => {
        return get().projects;
      },

      getActiveProjectIndex: () => {
        const state = get();
        const activeProject = state.projects.find(p => p.id === state.activeProjectId);
        return activeProject ? state.projects.findIndex(p => p.id === activeProject.id) : -1;
      }
    }),
    {
      name: 'project-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId
      }),
      // Migrate function for future version compatibility
      migrate: (persistedState: unknown) => {
        if (persistedState && typeof persistedState === 'object') {
          const state = persistedState as { projects: unknown[]; activeProjectId: string | null };

          // Validate and migrate old format if needed
          if (Array.isArray(state.projects)) {
            const validProjects = state.projects.filter(validateProject);

            if (validProjects.length !== state.projects.length) {
              console.warn('Some projects failed validation, removing them');
            }

            return {
              ...state,
              projects: validProjects
            };
          }
        }
        return persistedState;
      }
    }
  )
);

// Selectors for performance optimization
export const selectProjects = (state: ProjectStore) => state.projects;
export const selectActiveProject = (state: ProjectStore) => state.getActiveProject();
export const selectActiveProjectId = (state: ProjectStore) => state.activeProjectId;
export const selectActiveProjectIndex = (state: ProjectStore) => state.getActiveProjectIndex();

// Utility functions outside the store
export const projectUtils = {
  generateProjectId,
  validateProject
};