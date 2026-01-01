export interface ParsedTask {
  number: number
  title: string
  lineNumber: number
}

/**
 * Check if roadmap was AI generated
 */
export function isAIGenerated(content: string): boolean {
  return content.includes('<!-- AI_GENERATED -->')
}

/**
 * Parse roadmap and extract numbered tasks
 * Only works if <!-- AI_GENERATED --> marker is present
 */
export function parseRoadmapTasks(content: string): ParsedTask[] {
  // Check AI generation marker
  if (!isAIGenerated(content)) {
    return []
  }

  const tasks: ParsedTask[] = []
  const lines = content.split('\n')

  // Regex for "1. Task text" or "1) Task text"
  const taskRegex = /^(\d+)[\.)]\s+(.+)$/

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const match = line.match(taskRegex)

    if (match) {
      const number = parseInt(match[1], 10)
      const title = match[2].trim()

      // Validate number (should be sequential)
      if (number === tasks.length + 1) {
        tasks.push({ number, title, lineNumber: i + 1 })
      }
    }
  }

  return tasks
}
