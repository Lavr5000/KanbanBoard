export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'testing' | 'done';

export interface DateRange {
  startDate?: string; // ISO date format
  dueDate?: string;   // ISO date format
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  projectId: string; // Link to project
  // Date fields
  startDate?: string; // ISO date format
  dueDate?: string;   // ISO date format
}

export interface Column {
  id: TaskStatus;
  title: string;
  taskIds: string[];
}

export interface TaskFilters {
  search: string;
  statuses: TaskStatus[];
  dateRange: {
    start?: string;
    end?: string;
    hasDueDate?: boolean;
  };
}