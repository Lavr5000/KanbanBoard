export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'testing' | 'done';

export interface Assignee {
  id: string;
  name: string;
  avatar?: string;
  color?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
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
  // Construction fields
  startDate?: string; // ISO date format
  dueDate?: string;   // ISO date format
  assignees?: Assignee[]; // Array of assignees
  progress?: number;   // 0-100
  tags?: Tag[];        // Array of tags for categorization
}

export interface Column {
  id: TaskStatus;
  title: string;
  taskIds: string[];
}