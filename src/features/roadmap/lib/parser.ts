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
 */
export function parseRoadmapTasks(content: string): ParsedTask[] {
  const tasks: ParsedTask[] = []
  const lines = content.split('\n')

  console.log('🔍 [PARSER] Starting to parse roadmap content')
  console.log('📄 [PARSER] Total lines:', lines.length)
  console.log('📝 [PARSER] Content preview:', content.substring(0, 200) + '...')

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
  ]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Skip empty lines and headers
    if (!line || line.startsWith('#')) {
      continue
    }

    // Try each pattern until we find a match
    for (let patternIndex = 0; patternIndex < patterns.length; patternIndex++) {
      const pattern = patterns[patternIndex]
      const match = line.match(pattern)

      if (match) {
        const title = match[1].trim()
        const description = match[2].trim()
        const fullTitle = `${title} - ${description}`

        console.log(`✅ [PARSER] Line ${i + 1}: Found task with pattern ${patternIndex + 1}`)
        console.log(`   Title: "${title}"`)
        console.log(`   Description: "${description}"`)

        // Use sequential number
        tasks.push({ number: tasks.length + 1, title: fullTitle, lineNumber: i + 1 })
        break // Found a match, move to next line
      }
    }
  }

  console.log(`🎯 [PARSER] Parsing complete. Found ${tasks.length} tasks`)
  if (tasks.length === 0) {
    console.log('⚠️  [PARSER] No tasks found! Sample lines:')
    lines.slice(0, 10).forEach((line, i) => {
      if (line.trim()) console.log(`   Line ${i + 1}: "${line.trim()}"`)
    })
  }

  return tasks
}
