export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'testing' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
}

export interface Column {
  id: TaskStatus;
  title: string;
  taskIds: string[];
}