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
 * Works with multiple formats:
 * - "1. **Title:** Description" (AI format with bold + colon)
 * - "1. **Title** - Description" (with bold + dash)
 * - "1. Title: Description" (AI format without bold + colon)
 * - "1. Title - Description" (without bold + dash)
 * - "1) Title: Description" (with parentheses)
 * - Multi-line tasks with description on following lines
 */
export function parseRoadmapTasks(content: string): ParsedTask[] {
  const tasks: ParsedTask[] = []
  const lines = content.split('\n')

  // Try multiple regex patterns to match different formats
  const patterns = [
    // Format: "1. **Title:** Description" (with bold markdown + colon - AI format)
    /^\d+[\.)]\s+\*\*(.+?)\*\*:\s*(.+)$/,
    // Format: "1. **Title** - Description" (with bold markdown + dash)
    /^\d+[\.)]\s+\*\*(.+?)\*\*\s+-\s+(.+)$/,
    // Format: "1. Title: Description" (without bold + colon - AI format)
    /^\d+[\.)]\s+(.+?):\s*(.+)$/,
    // Format: "1. Title - Description" (without bold + dash)
    /^\d+[\.)]\s+(.+?)\s+-\s+(.+)$/,
    // Format: "1. **Title**" (just bold title, no description yet)
    /^\d+[\.)]\s+\*\*(.+?)\*\*$/,
    // Format: "1. Title" (just title, no description)
    /^\d+[\.)]\s+(.+)$/,
  ]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Skip empty lines and headers
    if (!line || line.startsWith('#')) {
      continue
    }

    // Skip lines that look like sections (not tasks)
    if (line.startsWith('**') && line.endsWith('**') && !line.match(/^\d+/)) {
      continue
    }

    // Try each pattern until we find a match
    for (let patternIndex = 0; patternIndex < patterns.length; patternIndex++) {
      const pattern = patterns[patternIndex]
      const match = line.match(pattern)

      if (match) {
        let title = match[1].trim()
        let description = match[2]?.trim() || ''

        // If no description on same line, look at next line(s)
        if (!description && i + 1 < lines.length) {
          // Collect following non-empty lines that aren't new tasks
          const descLines: string[] = []
          for (let j = i + 1; j < lines.length && j < i + 5; j++) {
            const nextLine = lines[j].trim()
            // Stop if empty, new task, or section
            if (!nextLine || nextLine.match(/^\d+[\.)]/) || nextLine.startsWith('#') || nextLine.startsWith('**')) {
              break
            }
            descLines.push(nextLine)
          }
          description = descLines.join(' ').trim()
        }

        // Clean up markdown formatting from title
        title = title.replace(/\*\*/g, '').trim()

        // Build full title
        const fullTitle = description ? `${title} - ${description}` : title

        // Use sequential number
        tasks.push({ number: tasks.length + 1, title: fullTitle, lineNumber: i + 1 })
        break // Found a match, move to next line
      }
    }
  }

  return tasks
}
