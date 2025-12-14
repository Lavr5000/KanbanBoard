export interface Task {
  id: string;
  title: string;
  description: string;
  columnId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
  order: number;
}

export interface KanbanState {
  columns: Column[];
  draggedTask: Task | null;
  draggedColumn: Column | null;
}

export interface KanbanActions {
  // Column actions
  addColumn: (title: string) => void;
  updateColumn: (id: string, title: string) => void;
  deleteColumn: (id: string) => void;
  moveColumn: (columnId: string, newOrder: number) => void;

  // Task actions
  addTask: (columnId: string, title: string, description?: string) => void;
  updateTask: (taskId: string, updates: Partial<Pick<Task, 'title' | 'description'>>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, newColumnId: string, newOrder: number) => void;

  // Drag and drop actions
  setDraggedTask: (task: Task | null) => void;
  setDraggedColumn: (column: Column | null) => void;

  // Utility actions
  clearBoard: () => void;
  reorderTasks: (columnId: string, startIndex: number, endIndex: number) => void;
}

export type KanbanStore = KanbanState & KanbanActions;