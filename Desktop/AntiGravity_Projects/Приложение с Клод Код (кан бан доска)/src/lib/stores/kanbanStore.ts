import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { KanbanStore, Column, Task } from '../../types/kanban';

const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

const createInitialColumns = (): Column[] => [
  {
    id: 'column-1',
    title: 'To Do',
    tasks: [],
    order: 0,
  },
  {
    id: 'column-2',
    title: 'In Progress',
    tasks: [],
    order: 1,
  },
  {
    id: 'column-3',
    title: 'Done',
    tasks: [],
    order: 2,
  },
];

export const useKanbanStore = create<KanbanStore>()(
  persist(
    (set, get) => ({
      // Initial state
      columns: createInitialColumns(),
      draggedTask: null,
      draggedColumn: null,

      // Column actions
      addColumn: (title: string) => {
        set((state) => {
          const newColumn: Column = {
            id: generateId(),
            title,
            tasks: [],
            order: state.columns.length,
          };
          return {
            columns: [...state.columns, newColumn],
          };
        });
      },

      updateColumn: (id: string, title: string) => {
        set((state) => ({
          columns: state.columns.map((column) =>
            column.id === id ? { ...column, title } : column
          ),
        }));
      },

      deleteColumn: (id: string) => {
        set((state) => {
          const updatedColumns = state.columns
            .filter((column) => column.id !== id)
            .map((column, index) => ({
              ...column,
              order: index,
            }));
          return {
            columns: updatedColumns,
          };
        });
      },

      moveColumn: (columnId: string, newOrder: number) => {
        set((state) => {
          const columns = [...state.columns];
          const columnToMove = columns.find((col) => col.id === columnId);

          if (!columnToMove) return state;

          // Remove column from current position
          const filteredColumns = columns.filter((col) => col.id !== columnId);

          // Insert column at new position
          const newColumns = [
            ...filteredColumns.slice(0, newOrder),
            columnToMove,
            ...filteredColumns.slice(newOrder),
          ];

          // Update order property for all columns
          return {
            columns: newColumns.map((col, index) => ({
              ...col,
              order: index,
            })),
          };
        });
      },

      // Task actions
      addTask: (columnId: string, title: string, description = '') => {
        const newTask: Task = {
          id: generateId(),
          title,
          description,
          columnId,
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          columns: state.columns.map((column) =>
            column.id === columnId
              ? {
                  ...column,
                  tasks: [...column.tasks, newTask].map((task, index) => ({
                    ...task,
                    order: index,
                  })),
                }
              : column
          ),
        }));
      },

      updateTask: (taskId: string, updates: Partial<Pick<Task, 'title' | 'description'>>) => {
        set((state) => ({
          columns: state.columns.map((column) => ({
            ...column,
            tasks: column.tasks.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    ...updates,
                    updatedAt: new Date(),
                  }
                : task
            ),
          })),
        }));
      },

      deleteTask: (taskId: string) => {
        set((state) => ({
          columns: state.columns.map((column) => ({
            ...column,
            tasks: column.tasks
              .filter((task) => task.id !== taskId)
              .map((task, index) => ({
                ...task,
                order: index,
              })),
          })),
        }));
      },

      moveTask: (taskId: string, newColumnId: string, newOrder: number) => {
        const { columns } = get();

        // Find the task to move
        const taskToMove = columns
          .flatMap((col) => col.tasks)
          .find((task) => task.id === taskId);

        if (!taskToMove) return;

        set((state) => {
          // Remove task from current column
          const updatedColumns = state.columns.map((column) => {
            if (column.id === taskToMove.columnId) {
              return {
                ...column,
                tasks: column.tasks
                  .filter((task) => task.id !== taskId)
                  .map((task, index) => ({
                    ...task,
                    order: index,
                  })),
              };
            }
            if (column.id === newColumnId) {
              // Add task to new column at specified position
              const updatedTask = {
                ...taskToMove,
                columnId: newColumnId,
                updatedAt: new Date(),
              };

              const newTasks = [...column.tasks];
              newTasks.splice(newOrder, 0, updatedTask);

              return {
                ...column,
                tasks: newTasks.map((task, index) => ({
                  ...task,
                  order: index,
                })),
              };
            }
            return column;
          });

          return { columns: updatedColumns };
        });
      },

      // Drag and drop actions
      setDraggedTask: (task: Task | null) => {
        set({ draggedTask: task });
      },

      setDraggedColumn: (column: Column | null) => {
        set({ draggedColumn: column });
      },

      // Utility actions
      clearBoard: () => {
        set({
          columns: createInitialColumns(),
          draggedTask: null,
          draggedColumn: null,
        });
      },

      reorderTasks: (columnId: string, startIndex: number, endIndex: number) => {
        set((state) => ({
          columns: state.columns.map((column) => {
            if (column.id !== columnId) return column;

            const tasks = [...column.tasks];
            const [removed] = tasks.splice(startIndex, 1);
            tasks.splice(endIndex, 0, removed);

            return {
              ...column,
              tasks: tasks.map((task, index) => ({
                ...task,
                order: index,
                updatedAt: new Date(),
              })),
            };
          }),
        }));
      },
    }),
    {
      name: 'kanban-board-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      onRehydrateStorage: () => (state) => {
        console.log('Kanban store hydrated:', state);
      },
    }
  )
);