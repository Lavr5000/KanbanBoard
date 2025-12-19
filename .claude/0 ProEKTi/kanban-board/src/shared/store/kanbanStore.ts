import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, TaskStatus, Priority } from '@/shared/types/task';

// Initial mock data to ensure board is never empty
const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Critical Bug Fix - Payment System',
    description: 'Fix critical payment processing bug affecting production users',
    status: 'todo',
    priority: 'urgent',
    startDate: '2025-01-15',
    dueDate: '2025-01-16',
    assignees: [
      { id: 'a1', name: 'Alex Smith', color: '#EF4444' },
      { id: 'a2', name: 'Sarah Lee', color: '#F59E0B' }
    ],
    progress: 0
  },
  {
    id: '2',
    title: 'Analysis of competitors',
    description: 'Analyze competitor products and features',
    status: 'todo',
    priority: 'medium',
    startDate: '2025-01-15',
    dueDate: '2025-01-20',
    assignees: [
      { id: 'a3', name: 'Mike Chen', color: '#3B82F6' },
      { id: 'a4', name: 'Tom Analyst', color: '#EC4899' }
    ],
    progress: 25
  },
  {
    id: '3',
    title: 'Create UI Kit',
    description: 'Design and develop component library',
    status: 'todo',
    priority: 'high',
    startDate: '2025-01-18',
    dueDate: '2025-01-25',
    assignees: [
      { id: 'a5', name: 'Lisa Designer', color: '#10B981' }
    ],
    progress: 0
  },
  {
    id: '4',
    title: 'Foundation Works',
    description: 'Excavation and concrete foundation for the main building',
    status: 'in-progress',
    priority: 'urgent',
    startDate: '2025-01-10',
    dueDate: '2025-01-15',
    assignees: [
      { id: 'a6', name: 'John Builder', color: '#F59E0B' },
      { id: 'a7', name: 'Tom Engineer', color: '#8B5CF6' }
    ],
    progress: 60
  },
  {
    id: '5',
    title: 'User Authentication',
    description: 'Implement user login and registration system',
    status: 'in-progress',
    priority: 'high',
    startDate: '2025-01-12',
    dueDate: '2025-01-20',
    assignees: [
      { id: 'a8', name: 'Backend Team', color: '#6366F1' }
    ],
    progress: 40
  },
  {
    id: '6',
    title: 'Code Review',
    description: 'Review pull requests and provide feedback',
    status: 'review',
    priority: 'medium',
    startDate: '2025-01-22',
    dueDate: '2025-01-23',
    assignees: [
      { id: 'a9', name: 'Senior Devs', color: '#8B5CF6' }
    ],
    progress: 80
  },
  {
    id: '7',
    title: 'Integration Testing',
    description: 'Test API integrations and data flow',
    status: 'testing',
    priority: 'high',
    startDate: '2025-01-24',
    dueDate: '2025-01-26',
    assignees: [
      { id: 'a10', name: 'QA Team', color: '#EC4899' }
    ],
    progress: 45
  },
  {
    id: '8',
    title: 'Documentation Update',
    description: 'Update API documentation and user guides',
    status: 'testing',
    priority: 'low',
    startDate: '2025-01-25',
    dueDate: '2025-01-30',
    assignees: [
      { id: 'a11', name: 'Tech Writer', color: '#10B981' }
    ],
    progress: 20
  },
  {
    id: '9',
    title: 'Deploy to Production',
    description: 'Deploy application to production environment',
    status: 'done',
    priority: 'medium',
    startDate: '2025-01-20',
    dueDate: '2025-01-21',
    assignees: [
      { id: 'a12', name: 'DevOps', color: '#F59E0B' }
    ],
    progress: 100
  }
];

// Data layer - pure data structure
interface KanbanData {
  tasks: Task[];
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

type KanbanStore = KanbanData & KanbanActions;

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export const useKanbanStore = create<KanbanStore>()(
  persist(
    (set, get) => ({
      // Initial data - use the predefined initialTasks
      tasks: initialTasks,

      // Actions
      addTask: (status, taskData) => set((state) => {
        const newTask: Task = {
          id: generateId(),
          title: taskData?.title || 'Новая задача',
          description: taskData?.description || 'Введите описание...',
          status,
          priority: taskData?.priority || 'medium',
          // Default values for new fields
          startDate: taskData?.startDate,
          dueDate: taskData?.dueDate,
          assignees: taskData?.assignees || [],
          progress: taskData?.progress ?? 0,
          ...taskData
        };
        return {
          tasks: [...state.tasks, newTask]
        };
      }),

      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(task => {
          if (task.id !== id) return task;

          // Validate and sanitize updates
          const sanitizedUpdates = { ...updates };

          // Validate progress is within 0-100
          if ('progress' in sanitizedUpdates) {
            sanitizedUpdates.progress = Math.max(0, Math.min(100, sanitizedUpdates.progress ?? 0));
          }

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

          // Validate assignees array
          if ('assignees' in sanitizedUpdates && !Array.isArray(sanitizedUpdates.assignees)) {
            delete sanitizedUpdates.assignees;
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
        return get().tasks.filter(task => task.status === status);
      },

      getTaskById: (id) => {
        return get().tasks.find(task => task.id === id);
      }
    }),
    {
      name: 'kanban-storage',
      // Only persist the data, not the actions
      partialize: (state) => ({
        tasks: state.tasks
      }),
      // Ensure we always have data on hydration
      onRehydrateStorage: () => (state) => {
        if (state && (!state.tasks || state.tasks.length === 0)) {
          console.log('No tasks found in storage, initializing with mock data');
          state.tasks = initialTasks;
        }
      }
    }
  )
);