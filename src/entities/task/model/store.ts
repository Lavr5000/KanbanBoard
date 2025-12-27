import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Column, Id, Task, Member } from './types';

const mockMembers: Member[] = [
  { id: '1', name: 'Евгений А.', initials: 'EA', avatarColor: 'bg-orange-500' },
  { id: '2', name: 'Анна М.', initials: 'AM', avatarColor: 'bg-blue-500' },
  { id: '3', name: 'Иван С.', initials: 'IS', avatarColor: 'bg-purple-500' },
];

interface BoardState {
  columns: Column[];
  tasks: Task[];
  searchQuery: string;
  members: Member[];
  isConfirmClearOpen: boolean;

  // Actions
  setTasks: (tasks: Task[]) => void;
  setColumns: (columns: Column[]) => void;
  addTask: (columnId: Id) => void;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, data: Partial<Task>) => void;
  moveTask: (taskId: Id, columnId: Id) => void;
  setSearchQuery: (query: string) => void;
  setConfirmClearOpen: (isOpen: boolean) => void;
  confirmClearBoard: () => void;
  clearBoard: () => void;
}

const defaultColumns: Column[] = [
  { id: 'todo', title: 'Новая задача' },
  { id: 'in-progress', title: 'Выполняется' },
  { id: 'awaiting-review', title: 'Ожидает проверки' },
  { id: 'testing', title: 'На тестировании' },
  { id: 'revision', title: 'В доработку' },
];

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      columns: defaultColumns,
      tasks: [],
      searchQuery: "",
      members: mockMembers,
      isConfirmClearOpen: false,

      setTasks: (tasks) => set({ tasks }),
      setColumns: (columns) => set({ columns }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setConfirmClearOpen: (isOpen) => set({ isConfirmClearOpen: isOpen }),

      addTask: (columnId) => set((state) => ({
        tasks: [
          ...state.tasks,
          {
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            columnId,
            content: `Новая задача ${state.tasks.length + 1}`,
            priority: "medium",
            status: "active",
            type: "feature",
            tags: [],
            createdAt: new Date().toISOString(),
          },
        ],
      })),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      })),

      updateTask: (id, data) => set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
      })),

      moveTask: (taskId, columnId) => {
        set((state) => {
          const updatedTasks = state.tasks.map((t) => (t.id === taskId ? { ...t, columnId } : t));
          return { tasks: updatedTasks };
        });
      },

      confirmClearBoard: () => {
        set({ isConfirmClearOpen: true });
      },

      clearBoard: () => {
        set({ tasks: [], isConfirmClearOpen: false });
      },
    }),
    {
      name: 'kanban-storage',
    }
  )
);

// Custom hook for statistics
export const useBoardStats = () => {
  const tasks = useBoardStore((state) => state.tasks);

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.columnId === "todo").length,
    inProgress: tasks.filter((t) => t.columnId === "in-progress").length,
    awaitingReview: tasks.filter((t) => t.columnId === "awaiting-review").length,
    testing: tasks.filter((t) => t.columnId === "testing").length,
    revision: tasks.filter((t) => t.columnId === "revision").length,
  };

  // Calculate done as sum of testing + revision (tasks that passed review)
  return {
    ...stats,
    done: stats.testing + stats.revision,
  };
};
