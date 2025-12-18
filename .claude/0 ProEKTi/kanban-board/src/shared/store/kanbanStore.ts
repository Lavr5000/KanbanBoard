import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, TaskStatus } from '@/shared/types/task';

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
      // Initial data
      tasks: [
        {
          id: '1',
          title: 'Analysis of competitors',
          description: 'Analyze competitor products and features',
          status: 'todo',
          priority: 'medium',
        },
        {
          id: '2',
          title: 'Create UI Kit',
          description: 'Design and develop component library',
          status: 'todo',
          priority: 'high',
        },
      ],

      // Actions
      addTask: (status, taskData) => set((state) => {
        const newTask: Task = {
          id: generateId(),
          title: taskData?.title || 'Новая задача',
          description: taskData?.description || 'Введите описание...',
          status,
          priority: taskData?.priority || 'medium',
          ...taskData
        };
        return {
          tasks: [...state.tasks, newTask]
        };
      }),

      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(task =>
          task.id === id ? { ...task, ...updates } : task
        )
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
      })
    }
  )
);