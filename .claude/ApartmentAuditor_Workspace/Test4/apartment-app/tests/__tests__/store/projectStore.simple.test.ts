/**
 * ProjectStore Simple Tests
 *
 * Simplified tests focusing on basic functionality without complex hooks
 */

import { useProjectStore } from '../../../services/store/projectStore';
import type { Project } from '../../../services/types/index';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock Zustand persist to avoid actual storage
jest.mock('zustand/middleware', () => ({
  persist: (createStore: any) => createStore,
}));

describe('ProjectStore - Simple', () => {
  beforeEach(() => {
    // Reset store state directly
    const initialState = useProjectStore.getState();
    initialState.projects = [];
    initialState.activeProjectId = null;
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should have empty initial state', () => {
      const state = useProjectStore.getState();

      expect(state.projects).toEqual([]);
      expect(state.activeProjectId).toBeNull();
    });

    it('should create a project', () => {
      const state = useProjectStore.getState();

      state.createProject('Test Project');

      expect(state.projects).toHaveLength(1);
      expect(state.projects[0]).toMatchObject({
        title: 'Test Project',
        address: '',
        finishMode: 'draft',
        isArchived: false,
        isActive: true,
      });
      expect(state.projects[0].id).toMatch(/^project_\d+_\d{3}$/);
    });

    it('should create project with address', () => {
      const state = useProjectStore.getState();

      state.createProject('Test Project', '123 Test St');

      expect(state.projects).toHaveLength(1);
      expect(state.projects[0]).toMatchObject({
        title: 'Test Project',
        address: '123 Test St',
        finishMode: 'draft',
      });
    });

    it('should set active project', () => {
      const state = useProjectStore.getState();

      // Create a project first
      state.createProject('Test Project');
      const projectId = state.projects[0].id;

      // Set it as active
      state.setActiveProject(projectId);

      expect(state.activeProjectId).toBe(projectId);
      expect(state.getActiveProject()?.title).toBe('Test Project');
    });

    it('should delete project', () => {
      const state = useProjectStore.getState();

      // Create a project first
      state.createProject('Test Project');
      const projectId = state.projects[0].id;

      // Delete it
      state.deleteProject(projectId);

      expect(state.projects).toHaveLength(0);
      expect(state.activeProjectId).toBeNull();
    });

    it('should archive project', () => {
      const state = useProjectStore.getState();

      // Create a project first
      state.createProject('Test Project');
      const projectId = state.projects[0].id;

      // Archive it
      state.archiveProject(projectId);

      expect(state.projects[0].isArchived).toBe(true);
      expect(state.getActiveProjects()).toHaveLength(0);
      expect(state.getArchivedProjects()).toHaveLength(1);
    });

    it('should update project', () => {
      const state = useProjectStore.getState();

      // Create a project first
      state.createProject('Test Project');
      const projectId = state.projects[0].id;

      // Update it
      state.updateProject(projectId, {
        title: 'Updated Project',
        address: '456 Updated St',
      });

      expect(state.projects[0]).toMatchObject({
        title: 'Updated Project',
        address: '456 Updated St',
      });
    });
  });

  describe('Getter functions', () => {
    beforeEach(() => {
      const state = useProjectStore.getState();
      state.projects = [];
      state.activeProjectId = null;
    });

    it('should return active projects only', () => {
      const state = useProjectStore.getState();

      state.createProject('Active Project 1');
      state.createProject('Active Project 2');
      const archivedId = state.projects[1].id;
      state.archiveProject(archivedId);

      const activeProjects = state.getActiveProjects();
      const archivedProjects = state.getArchivedProjects();

      expect(activeProjects).toHaveLength(1);
      expect(archivedProjects).toHaveLength(1);
      expect(activeProjects[0].title).toBe('Active Project 1');
      expect(archivedProjects[0].title).toBe('Active Project 2');
    });

    it('should return all projects', () => {
      const state = useProjectStore.getState();

      state.createProject('Project 1');
      state.createProject('Project 2');
      state.archiveProject(state.projects[1].id);

      const allProjects = state.getAllProjects();

      expect(allProjects).toHaveLength(2);
    });
  });
});