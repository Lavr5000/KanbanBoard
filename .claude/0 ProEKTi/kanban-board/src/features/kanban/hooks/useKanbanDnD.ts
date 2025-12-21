import { DragEndEvent } from '@dnd-kit/core';
import { useKanbanStore } from '@/shared/store/kanbanStore';
import type { TaskStatus, Task } from '@/shared/types/task';

export const useKanbanDnD = () => {
  const moveTask = useKanbanStore((state) => state.moveTask);
  const getTaskById = useKanbanStore((state) => state.getTaskById);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // No drop target - cancel operation
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Early exit for performance - same target
    if (activeId === overId) return;

    // Get active task using new selector method
    const activeTask = getTaskById(activeId);
    if (!activeTask) {
      console.warn(`Task with id ${activeId} not found`);
      return;
    }

    // Determine new status from drop target
    const overData = over.data.current;
    let newStatus: TaskStatus;
    let targetId: string | undefined;

    if (overData?.type === 'Column') {
      // Dropped on column (empty area)
      newStatus = overData.status as TaskStatus;
      targetId = undefined; // Add to end of column
    } else if (overData?.type === 'Task') {
      // Dropped on another task - use target's status and position
      const targetTask: Task = overData.task;
      newStatus = targetTask.status;
      targetId = overId;
    } else {
      // Fallback: overId might be a valid status (column ID)
      const validStatuses: TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];
      if (validStatuses.includes(overId as TaskStatus)) {
        newStatus = overId as TaskStatus;
        targetId = undefined;
      } else {
        console.warn(`Invalid drop target: ${overId}`);
        return; // Invalid drop target
      }
    }

    // Only move if status actually changed or position within column changed
    const statusChanged = activeTask.status !== newStatus;
    const positionChanged = targetId !== undefined;

    if (statusChanged || positionChanged) {
      moveTask(activeId, newStatus, targetId);
    }
  };

  return {
    handleDragEnd,
  };
};