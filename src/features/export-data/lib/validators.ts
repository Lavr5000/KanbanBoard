import { Task } from '@/lib/supabase/types';

export function showEmptyState(tasks: Task[] | undefined): boolean {
  return !tasks || tasks.length === 0;
}

export function exceedsLimit(tasks: Task[] | undefined, limit: number = 100): boolean {
  if (!tasks) return false;
  return tasks.length > limit;
}
