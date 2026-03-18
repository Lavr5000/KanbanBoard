export interface TaskCreationResult {
  success: boolean
  created: number
  errors: string[]
}

/**
 * Create first N tasks from parsed roadmap
 * Searches for "New Tasks" column or uses first column
 */
export async function createTasksFromRoadmap(
  boardId: string,
  tasks: Array<{ title: string }>,
  maxTasks: number = 5
): Promise<TaskCreationResult> {
  if (tasks.length === 0) {
    return {
      success: false,
      created: 0,
      errors: ['Нет задач для создания'],
    }
  }

  try {
    const res = await fetch(`/api/roadmaps/${boardId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks, maxTasks }),
    })
    return await res.json()
  } catch (error) {
    return {
      success: false,
      created: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    }
  }
}
