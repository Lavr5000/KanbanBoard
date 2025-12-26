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

  // Actions
  setTasks: (tasks: Task[]) => void;
  setColumns: (columns: Column[]) => void;
  addTask: (columnId: Id) => void;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, data: Partial<Task>) => void;
  moveTask: (taskId: Id, columnId: Id) => void;
  setSearchQuery: (query: string) => void;
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

      setTasks: (tasks) => set({ tasks }),
      setColumns: (columns) => set({ columns }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      addTask: (columnId) => set((state) => ({
        tasks: [
          ...state.tasks,
          {
            id: Math.floor(Math.random() * 10001),
            columnId,
            content: `Новая задача ${state.tasks.length + 1}`,
            priority: "medium",
            status: "active",
            type: "feature",
            tags: ["UI"],
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
        console.log('📦 moveTask called:', { taskId, columnId });
        set((state) => {
          const updatedTasks = state.tasks.map((t) => (t.id === taskId ? { ...t, columnId } : t));
          console.log('📦 Updated tasks:', updatedTasks.map(t => ({ id: t.id, columnId: t.columnId })));
          return { tasks: updatedTasks };
        });
      },

      clearBoard: () => {
        if (confirm("Вы уверены, что хотите удалить ВСЕ задачи?")) {
          set({ tasks: [] });
        }
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

  return {
    total: tasks.length,
    todo: tasks.filter((t) => t.columnId === "todo").length,
    inProgress: tasks.filter((t) => t.columnId === "in-progress").length,
    awaitingReview: tasks.filter((t) => t.columnId === "awaiting-review").length,
    testing: tasks.filter((t) => t.columnId === "testing").length,
    revision: tasks.filter((t) => t.columnId === "revision").length,
    done: tasks.filter((t) => t.columnId === "revision").length, // Revision = done
  };
};
