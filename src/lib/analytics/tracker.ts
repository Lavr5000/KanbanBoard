/**
 * Analytics tracking utility
 */

export interface AnalyticsEvent {
  eventType: string
  properties?: Record<string, any>
}

export interface AIUsageEvent {
  model: string
  operation: string
  inputTokens?: number
  outputTokens?: number
  costUsd?: number
  boardId?: string
  metadata?: Record<string, any>
}

/**
 * Track user analytics event
 */
export async function trackEvent(eventType: string, properties: Record<string, any> = {}) {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, properties }),
    })
  } catch (error) {
    console.error('Failed to track analytics event:', error)
  }
}

/**
 * Track AI API usage
 */
export async function trackAIUsage(aiUsage: AIUsageEvent) {
  try {
    await fetch('/api/analytics/ai-usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: aiUsage.model,
        operation: aiUsage.operation,
        inputTokens: aiUsage.inputTokens || 0,
        outputTokens: aiUsage.outputTokens || 0,
        costUsd: aiUsage.costUsd || 0,
        boardId: aiUsage.boardId || null,
        metadata: aiUsage.metadata || {},
      }),
    })
  } catch (error) {
    console.error('Failed to track AI usage:', error)
  }
}

/**
 * Track task creation
 */
export async function trackTaskCreated(taskId: string, columnId: string, boardId: string) {
  await trackEvent('task_created', {
    task_id: taskId,
    column_id: columnId,
    board_id: boardId
  })
}

/**
 * Track task move
 */
export async function trackTaskMoved(taskId: string, fromColumn: string, toColumn: string) {
  await trackEvent('task_moved', {
    task_id: taskId,
    from_column: fromColumn,
    to_column: toColumn
  })
}

/**
 * Track task deletion
 */
export async function trackTaskDeleted(taskId: string, columnId: string) {
  await trackEvent('task_deleted', {
    task_id: taskId,
    column_id: columnId
  })
}

/**
 * Track task update
 */
export async function trackTaskUpdated(taskId: string, fields: string[]) {
  await trackEvent('task_updated', {
    task_id: taskId,
    fields_updated: fields
  })
}

/**
 * Track column creation
 */
export async function trackColumnCreated(columnId: string, boardId: string) {
  await trackEvent('column_created', {
    column_id: columnId,
    board_id: boardId
  })
}

/**
 * Track AI suggestion used
 */
export async function trackAISuggestionUsed(taskId: string, boardId: string) {
  await trackEvent('ai_suggestion_used', {
    task_id: taskId,
    board_id: boardId
  })
}

/**
 * Track AI roadmap generated
 */
export async function trackAIRoadmapGenerated(boardId: string, taskCount: number) {
  await trackEvent('ai_roadmap_generated', {
    board_id: boardId,
    task_count: taskCount
  })
}

/**
 * Track board created
 */
export async function trackBoardCreated(boardId: string, name: string) {
  await trackEvent('board_created', {
    board_id: boardId,
    board_name: name
  })
}

/**
 * Calculate AI cost based on model and tokens
 * OpenAI pricing (as of 2025)
 */
export function calculateAICost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4o': { input: 0.0000025, output: 0.00001 },    // $2.5/1M input, $10/1M output
    'gpt-4o-mini': { input: 0.00000015, output: 0.0000006 }, // $0.15/1M input, $0.60/1M output
    'claude-3-5-sonnet': { input: 0.000003, output: 0.000015 },
    'claude-3-5-haiku': { input: 0.0000008, output: 0.000004 },
  }

  const rates = pricing[model] || pricing['gpt-4o-mini']
  return (inputTokens * rates.input) + (outputTokens * rates.output)
}
