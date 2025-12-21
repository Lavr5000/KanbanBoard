export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'testing' | 'done';

export interface Assignee {
  id: string;
  name: string;
  avatar?: string;
  color?: string;
}


export interface DateRange {
  startDate?: string; // ISO date format
  dueDate?: string;   // ISO date format
}

export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  projectId: string; // Link to project
  // Construction fields
  startDate?: string; // ISO date format
  dueDate?: string;   // ISO date format
  assignees?: Assignee[]; // Array of assignees
  progress?: number;   // 0-100
}

export interface Column {
  id: TaskStatus;
  title: string;
  taskIds: string[];
}

export interface TaskFilters {
  search: string;
  priorities: Priority[];
  statuses: TaskStatus[];
  dateRange: {
    start?: string;
    end?: string;
    hasDueDate?: boolean;
  };
}