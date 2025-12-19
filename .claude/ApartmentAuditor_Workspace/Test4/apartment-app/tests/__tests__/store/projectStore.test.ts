/**
 * ProjectStore Tests
 *
 * Testing Zustand store for project management functionality
 */

import { renderHook, act, cleanup } from '@testing-library/react-native';
import { useProjectStore } from '../../../services/store/projectStore';
import type { Project } from '../../../services/types/index';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

// Mock the persist middleware to avoid actual storage
jest.mock('zustand/middleware', () => ({
  persist: (createStore: any) => (...args: any[]) => {
    const store = createStore(...args);
    return {
      ...store,
      persist: {
        setOptions: jest.fn(),
        rehydrate: jest.fn(),
        hasHydrated: () => true,
      },
    };
  },
  createJSONStorage: () => ({
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  }),
}));

// Increase timeout for hook cleanup
jest.setTimeout(10000);

describe('ProjectStore', () => {
  // Reset store before each test
  beforeEach(() => {
    // Clear any persisted state
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with empty projects array', () => {
      const { result } = renderHook(() => useProjectStore());

      expect(result.current.projects).toEqual([]);
      expect(result.current.activeProjectId).toBeNull();
    });
  });

  describe('createProject', () => {
    it('should create a new project with title only', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.createProject('Test Project');
      });

      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0]).toMatchObject({
        title: 'Test Project',
        address: '',
        finishMode: 'draft',
        isArchived: false,
      });
      expect(result.current.projects[0].id).toMatch(/^project_\d+_\d{3}$/);
    });

    it('should create a new project with title and address', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.createProject('Test Project', '123 Test St');
      });

      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0]).toMatchObject({
        title: 'Test Project',
        address: '123 Test St',
        finishMode: 'draft',
        isArchived: false,
      });
    });

    it('should generate unique IDs for multiple projects', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.createProject('Project 1');
      });

      act(() => {
        result.current.createProject('Project 2');
      });

      expect(result.current.projects).toHaveLength(2);
      expect(result.current.projects[0].id).not.toBe(result.current.projects[1].id);
    });
  });

  describe('updateProject', () => {
    it('should update project properties', () => {
      const { result } = renderHook(() => useProjectStore());

      // Create a project first
      act(() => {
        result.current.createProject('Test Project');
      });

      const projectId = result.current.projects[0].id;

      // Update the project
      act(() => {
        result.current.updateProject(projectId, {
          title: 'Updated Project',
          address: '456 Updated St',
        });
      });

      const updatedProject = result.current.projects[0];
      expect(updatedProject.title).toBe('Updated Project');
      expect(updatedProject.address).toBe('456 Updated St');
    });

    it('should not update non-existent project', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.updateProject('non-existent-id', {
          title: 'Should not work',
        });
      });

      expect(result.current.projects).toEqual([]);
    });
  });

  describe('deleteProject', () => {
    it('should delete a project', () => {
      const { result } = renderHook(() => useProjectStore());

      // Create projects
      act(() => {
        result.current.createProject('Project 1');
      });

      act(() => {
        result.current.createProject('Project 2');
      });

      expect(result.current.projects).toHaveLength(2);

      // Delete one project
      const projectId = result.current.projects[0].id;

      act(() => {
        result.current.deleteProject(projectId);
      });

      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0].title).toBe('Project 2');
    });

    it('should clear active project if deleted project was active', () => {
      const { result } = renderHook(() => useProjectStore());

      // Create and set active project
      act(() => {
        result.current.createProject('Test Project');
      });

      const projectId = result.current.projects[0].id;

      act(() => {
        result.current.setActiveProject(projectId);
      });

      expect(result.current.activeProjectId).toBe(projectId);

      // Delete the active project
      act(() => {
        result.current.deleteProject(projectId);
      });

      expect(result.current.activeProjectId).toBeNull();
    });
  });

  describe('archiveProject', () => {
    it('should archive a project', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.createProject('Test Project');
      });

      const projectId = result.current.projects[0].id;

      act(() => {
        result.current.archiveProject(projectId);
      });

      const project = result.current.projects[0];
      expect(project.isArchived).toBe(true);
    });
  });

  describe('unarchiveProject', () => {
    it('should unarchive a project', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.createProject('Test Project');
      });

      const projectId = result.current.projects[0].id;

      // Archive first
      act(() => {
        result.current.archiveProject(projectId);
      });

      expect(result.current.projects[0].isArchived).toBe(true);

      // Then unarchive
      act(() => {
        result.current.unarchiveProject(projectId);
      });

      expect(result.current.projects[0].isArchived).toBe(false);
    });
  });

  describe('setActiveProject', () => {
    it('should set active project', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.createProject('Test Project');
      });

      const projectId = result.current.projects[0].id;

      act(() => {
        result.current.setActiveProject(projectId);
      });

      expect(result.current.activeProjectId).toBe(projectId);
    });

    it('should clear active project with null', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.createProject('Test Project');
      });

      const projectId = result.current.projects[0].id;

      act(() => {
        result.current.setActiveProject(projectId);
      });

      expect(result.current.activeProjectId).toBe(projectId);

      act(() => {
        result.current.setActiveProject(null);
      });

      expect(result.current.activeProjectId).toBeNull();
    });
  });

  describe('getter functions', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useProjectStore());

      // Create test projects
      act(() => {
        result.current.createProject('Active Project 1', 'Address 1');
      });

      act(() => {
        result.current.createProject('Active Project 2', 'Address 2');
      });

      act(() => {
        result.current.createProject('Archived Project', 'Address 3');
      });

      // Archive the third project
      const archivedId = result.current.projects[2].id;
      act(() => {
        result.current.archiveProject(archivedId);
      });

      // Set the first project as active
      const activeId = result.current.projects[0].id;
      act(() => {
        result.current.setActiveProject(activeId);
      });
    });

    it('getAllProjects should return all projects', () => {
      const { result } = renderHook(() => useProjectStore());

      const allProjects = result.current.getAllProjects();
      expect(allProjects).toHaveLength(3);
    });

    it('getActiveProjects should return only non-archived projects', () => {
      const { result } = renderHook(() => useProjectStore());

      const activeProjects = result.current.getActiveProjects();
      expect(activeProjects).toHaveLength(2);
      expect(activeProjects.every(p => !p.isArchived)).toBe(true);
    });

    it('getArchivedProjects should return only archived projects', () => {
      const { result } = renderHook(() => useProjectStore());

      const archivedProjects = result.current.getArchivedProjects();
      expect(archivedProjects).toHaveLength(1);
      expect(archivedProjects[0].isArchived).toBe(true);
    });

    it('getActiveProject should return the currently active project', () => {
      const { result } = renderHook(() => useProjectStore());

      const activeProject = result.current.getActiveProject();
      expect(activeProject).toBeTruthy();
      expect(activeProject?.title).toBe('Active Project 1');
    });

    it('getActiveProject should return null if no active project', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.setActiveProject(null);
      });

      const activeProject = result.current.getActiveProject();
      expect(activeProject).toBeNull();
    });

    it('getActiveProjectIndex should return correct index', () => {
      const { result } = renderHook(() => useProjectStore());

      const index = result.current.getActiveProjectIndex();
      expect(index).toBe(0);
    });

    it('getActiveProjectIndex should return -1 if no active project', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.setActiveProject(null);
      });

      const index = result.current.getActiveProjectIndex();
      expect(index).toBe(-1);
    });
  });
});