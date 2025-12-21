import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, TaskStatus, TaskFilters } from '@/shared/types/task';
import { Project, CreateProjectInput, UpdateProjectInput, PROJECT_COLORS } from '@/shared/types/project';

// Initial mock data to ensure board is never empty
const initialTasks: Task[] = [
  {
    id: 'bug-1',
    title: 'Bug Fix: Login validation issue',
    description: 'Fix critical login form validation bug affecting user authentication',
    status: 'todo',
    projectId: 'default-project',
    startDate: '2025-01-19',
    dueDate: '2025-01-20'
  },
  {
    id: '1',
    title: 'Critical Bug Fix - Payment System',
    description: 'Fix critical payment processing bug affecting production users',
    status: 'todo',
    projectId: 'default-project',
    startDate: '2025-01-15',
    dueDate: '2025-01-17' // Overdue - shows red indicator
  },
  {
    id: '2',
    title: 'Analysis of competitors',
    description: 'Analyze competitor products and features',
    status: 'todo',
    projectId: 'default-project',
    startDate: '2025-01-15',
    dueDate: '2025-01-20'
  },
  {
    id: '3',
    title: 'Create UI Kit',
    description: 'Design and develop component library',
    status: 'todo',
    projectId: 'default-project',
    startDate: '2025-01-15',
    dueDate: '2025-01-19' // Due today - shows orange indicator
  },
  {
    id: '4',
    title: 'Foundation Works',
    description: 'Excavation and concrete foundation for the main building',
    status: 'in-progress',
    projectId: 'default-project',
    startDate: '2025-01-10',
    dueDate: '2025-01-22' // Due in 3 days - shows yellow indicator
  },
  {
    id: '5',
    title: 'User Authentication',
    description: 'Implement user login and registration system',
    status: 'in-progress',
    projectId: 'default-project',
    startDate: '2025-01-12',
    dueDate: '2025-01-20'
  },
  {
    id: '6',
    title: 'Code Review',
    description: 'Review pull requests and provide feedback',
    status: 'review',
    projectId: 'default-project',
    startDate: '2025-01-22',
    dueDate: '2025-01-23'
  },
    {
    id: '9',
    title: 'Deploy to Production',
    description: 'Deploy application to production environment',
    status: 'done',
    projectId: 'default-project',
    startDate: '2025-01-20',
    dueDate: '2025-01-21'
  }
];

// Default project for migration
const DEFAULT_PROJECT: Project = {
  id: 'default-project',
  name: 'Основной проект',
  description: 'Проект по умолчанию для существующих задач',
  color: '#3B82F6',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  taskCount: initialTasks.length,
  isActive: true
};

// Data layer - pure data structure
interface KanbanData {
  tasks: Task[];
  projects: Project[];
  currentProjectId: string | null;
  filters: TaskFilters;
}

// Project actions
interface ProjectActions {
  // CRUD operations for projects
  createProject: (projectData: CreateProjectInput) => void;
  updateProject: (id: string, updates: UpdateProjectInput) => void;
  deleteProject: (id: string) => void;

  // Project navigation
  setCurrentProject: (projectId: string | null) => void;
  getCurrentProject: () => Project | null;

  // Project-specific task operations
  getProjectTasks: (projectId: string) => Task[];
  getCurrentProjectTasks: () => Task[];
  updateProjectTaskCounts: () => void;
}

// Actions layer - operations on data
interface KanbanActions {
  // CRUD operations
  addTask: (status: TaskStatus, task?: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // DnD operations with optimistic updates
  moveTask: (taskId: string, newStatus: TaskStatus, overId?: string) => void;

  // Utility operations
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTaskById: (id: string) => Task | undefined;
}

// Filter operations
interface KanbanFilters {
  filters: TaskFilters;
  setFilters: (filters: TaskFilters) => void;
  clearFilters: () => void;
  getFilteredTasks: () => Task[];
}

type KanbanStore = KanbanData & KanbanActions & ProjectActions & KanbanFilters;

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export const useKanbanStore = create<KanbanStore>()(
  persist(
    (set, get) => ({
      // Initial data - use the predefined initialTasks
      tasks: initialTasks,
      projects: [DEFAULT_PROJECT],
      currentProjectId: 'default-project',

      // Initial filters - all empty
      filters: {
        search: '',
        statuses: [],
        dateRange: {
          start: undefined,
          end: undefined,
          hasDueDate: undefined
        }
      },

      // Project Actions
      createProject: (projectData) => set((state) => {
        const newProject: Project = {
          id: generateId(),
          name: projectData.name,
          description: projectData.description,
          color: projectData.color,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          taskCount: 0,
          isActive: false
        };

        return {
          projects: [...state.projects, newProject]
        };
      }),

      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map(project =>
          project.id === id
            ? { ...project, ...updates, updatedAt: new Date().toISOString() }
            : project
        )
      })),

      deleteProject: (id) => set((state) => {
        // Don't allow deletion of the default project
        if (id === 'default-project') {
          console.warn('Cannot delete default project');
          return state;
        }

        const updatedProjects = state.projects.filter(p => p.id !== id);

        // If deleting current project, switch to default
        const newCurrentId = state.currentProjectId === id ? 'default-project' : state.currentProjectId;

        return {
          projects: updatedProjects,
          currentProjectId: newCurrentId
        };
      }),

      setCurrentProject: (projectId) => set((state) => ({
        currentProjectId: projectId
      })),

      getCurrentProject: () => {
        const state = get();
        return state.projects.find(p => p.id === state.currentProjectId) || null;
      },

      getProjectTasks: (projectId) => {
        const state = get();
        return state.tasks.filter(task => task.projectId === projectId);
      },

      getCurrentProjectTasks: () => {
        const state = get();
        return state.tasks.filter(task => task.projectId === state.currentProjectId);
      },

      updateProjectTaskCounts: () => set((state) => {
        const updatedProjects = state.projects.map(project => ({
          ...project,
          taskCount: state.tasks.filter(task => task.projectId === project.id).length
        }));

        return {
          projects: updatedProjects
        };
      }),

      // Actions
      addTask: (status, taskData) => set((state) => {
        const currentProject = state.projects.find(p => p.id === state.currentProjectId) || DEFAULT_PROJECT;

        const newTask: Task = {
          id: generateId(),
          title: taskData?.title || 'Новая задача',
          description: taskData?.description || 'Введите описание...',
          status,
          projectId: currentProject.id,
          // Default values for new fields
          startDate: taskData?.startDate,
          dueDate: taskData?.dueDate
        };

        // Update task count for the project
        const updatedProjects = state.projects.map(project =>
          project.id === currentProject.id
            ? { ...project, taskCount: project.taskCount + 1 }
            : project
        );

        return {
          tasks: [...state.tasks, newTask],
          projects: updatedProjects
        };
      }),

      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(task => {
          if (task.id !== id) return task;

          // Validate and sanitize updates
          const sanitizedUpdates = { ...updates };

          // Validate dates are in proper format
          if ('startDate' in sanitizedUpdates && sanitizedUpdates.startDate) {
            const startDate = new Date(sanitizedUpdates.startDate);
            if (isNaN(startDate.getTime())) {
              delete sanitizedUpdates.startDate;
            }
          }

          if ('dueDate' in sanitizedUpdates && sanitizedUpdates.dueDate) {
            const dueDate = new Date(sanitizedUpdates.dueDate);
            if (isNaN(dueDate.getTime())) {
              delete sanitizedUpdates.dueDate;
            }
          }

          return { ...task, ...sanitizedUpdates };
        })
      })),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(task => task.id !== id)
      })),

      moveTask: (taskId, newStatus, overId) => {
        // Optimistic update
        const currentState = get();
        const currentTasks = currentState.tasks;
        const taskIndex = currentTasks.findIndex(t => t.id === taskId);

        if (taskIndex === -1) return;

        const task = { ...currentTasks[taskIndex], status: newStatus };
        const newTasks = [...currentTasks];
        newTasks.splice(taskIndex, 1);

        if (overId) {
          const overIndex = newTasks.findIndex(t => t.id === overId);
          newTasks.splice(overIndex, 0, task);
        } else {
          newTasks.push(task);
        }

        set({ tasks: newTasks });
      },

      // Utility selectors
      getTasksByStatus: (status) => {
        return get().getFilteredTasks().filter(task => task.status === status);
      },

      getTaskById: (id) => {
        return get().tasks.find(task => task.id === id);
      },

      // Filter methods
      setFilters: (newFilters) => set({ filters: newFilters }),

      clearFilters: () => set({
        filters: {
          search: '',
          statuses: [],
          dateRange: {
            start: undefined,
            end: undefined,
            hasDueDate: undefined
          }
        }
      }),

      getFilteredTasks: () => {
        const { tasks, filters } = get();

        return tasks.filter(task => {
          // Search filter - case-insensitive search in title and description
          if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            const titleMatch = task.title.toLowerCase().includes(searchTerm);
            const descriptionMatch = task.description.toLowerCase().includes(searchTerm);
            if (!titleMatch && !descriptionMatch) return false;
          }

          
          // Status filter
          if (filters.statuses.length > 0) {
            if (!filters.statuses.includes(task.status)) return false;
          }

          // Date range filters
          const { dateRange } = filters;

          // Has due date filter
          if (dateRange.hasDueDate && !task.dueDate) {
            return false;
          }

          // Start date filter
          if (dateRange.start && task.dueDate) {
            const taskDueDate = new Date(task.dueDate);
            const filterStartDate = new Date(dateRange.start);
            if (taskDueDate < filterStartDate) return false;
          }

          // End date filter
          if (dateRange.end && task.dueDate) {
            const taskDueDate = new Date(task.dueDate);
            const filterEndDate = new Date(dateRange.end);
            if (taskDueDate > filterEndDate) return false;
          }

          return true;
        });
      }
    }),
    {
      name: 'kanban-storage',
      // Only persist the data, not the actions
      partialize: (state) => ({
        tasks: state.tasks,
        projects: state.projects,
        currentProjectId: state.currentProjectId,
        filters: state.filters
      }),
      // Ensure we always have data on hydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Migration: if no projects exist, create default project
          if (!state.projects || state.projects.length === 0) {
            console.log('No projects found in storage, creating default project');
            state.projects = [DEFAULT_PROJECT];
            state.currentProjectId = 'default-project';
          }

          // Migration: add projectId to existing tasks
          if (state.tasks && state.tasks.length > 0) {
            const needsMigration = state.tasks.some(task => !('projectId' in task));
            if (needsMigration) {
              console.log('Migrating tasks to project structure');
              state.tasks = state.tasks.map(task => ({
                ...task,
                projectId: task.projectId || 'default-project'
              }));
            }
          }

          // Initialize tasks if empty
          if (!state.tasks || state.tasks.length === 0) {
            console.log('No tasks found in storage, initializing with mock data');
            state.tasks = initialTasks;
          } else {
            // Clean up tags from existing tasks
            state.tasks = state.tasks.map(task => {
              const { tags, ...taskWithoutTags } = task as any;
              return taskWithoutTags as Task;
            });
          }

          // Ensure current project exists
          if (!state.currentProjectId || !state.projects.find(p => p.id === state.currentProjectId)) {
            state.currentProjectId = state.projects[0]?.id || 'default-project';
          }

          // Update task counts
          state.projects = state.projects.map(project => ({
            ...project,
            taskCount: state.tasks.filter(task => task.projectId === project.id).length
          }));

          // Ensure filters exist
          if (!state.filters) {
            state.filters = {
              search: '',
              statuses: [],
              dateRange: {
                start: undefined,
                end: undefined,
                hasDueDate: undefined
              }
            };
          }
        }
      }
    }
  )
);