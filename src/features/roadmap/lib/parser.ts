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
 * Clean AI-generated roadmap by removing metadata and conversational text
 * Keeps only the clean roadmap content between <!-- AI_GENERATED --> and options
 */
export function cleanRoadmapContent(content: string): string {
  // Find the AI_GENERATED marker
  const markerIndex = content.indexOf('<!-- AI_GENERATED -->')
  if (markerIndex === -1) {
    return content
  }

  // Get content after the marker
  let cleaned = content.substring(markerIndex + '<!-- AI_GENERATED -->'.length).trim()

  // Remove text after horizontal rule (---)
  const hrMatch = cleaned.match(/\n---+/)
  if (hrMatch) {
    cleaned = cleaned.substring(0, hrMatch.index).trim()
  }

  // Remove markdown ## headers (but keep # main title)
  cleaned = cleaned.replace(/^## (.+)$/gm, '$1')

  return cleaned
}

/**
 * Parse roadmap and extract numbered tasks
 * Works with any content that has numbered tasks
 */
export function parseRoadmapTasks(content: string): ParsedTask[] {
  const tasks: ParsedTask[] = []
  const lines = content.split('\n')

  // Regex for "1. Task text" or "1) Task text" with optional bold ****
  const taskRegex = /^\d+[\.)]\s+\*\*(.+?)\*\*\s+-\s+(.+)$/

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const match = line.match(taskRegex)

    if (match) {
      const title = match[1].trim()
      const description = match[2].trim()
      const fullTitle = `${title} - ${description}`

      // Use sequential number
      tasks.push({ number: tasks.length + 1, title: fullTitle, lineNumber: i + 1 })
    }
  }

  return tasks
}
