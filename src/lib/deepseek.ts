/**
 * DeepSeek API client for AI task suggestions
 */

export interface AISuggestionRequest {
  taskContent: string
  columnTitle: string
  boardName: string
  nearbyTasks: Array<{ content: string }>
}

export interface AISuggestionResponse {
  improvedTitle: string
  description: string | null
  acceptanceCriteria: string[]
  risks: string[]
}

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

const SYSTEM_PROMPT = `Ты - AI-ассистент для Kanban доски. Твоя задача - улучшать формулировки задач.

На вход ты получаешь:
- Текст новой задачи
- Название колонки (контекст статуса)
- Название проекта
- 3-5 соседних задач в этой же колонке (для понимания стиля и контекста проекта)

Ты должен вернуть JSON с улучшениями:

{
  "improvedTitle": "более конкретное и ясное название",
  "description": "развёрнутое описание (если нужно добавить контекст), или null",
  "acceptanceCriteria": ["критерий 1", "критерий 2", "критерий 3"],
  "risks": ["риск 1", "риск 2"]
}

Правила:
- improvedTitle: должно быть конкретным, начинаться с глагола
- description: добавляй только если оригинал недостаточно подробный, иначе null
- acceptanceCriteria: 3-5 конкретных проверяемых критериев
- risks: 2-4 потенциальных проблем или забытых аспектов
- Учитывай стиль соседних задач
- Используй русский язык
- Не придумывай детали - только улучшай и структурируй то, что есть
- Возвращай только JSON, без дополнительного текста`

/**
 * Generate AI suggestions for a task using DeepSeek API
 */
export async function generateTaskSuggestions(
  request: AISuggestionRequest
): Promise<AISuggestionResponse> {
  const apiKey = process.env.DEEPSEEK_API_KEY

  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not set')
  }

  // Build user message with context
  const nearbyTasksText = request.nearbyTasks
    .map((t, i) => `${i + 1}. ${t.content}`)
    .join('\n')

  const userMessage = `Задача: ${request.taskContent}
Колонка: ${request.columnTitle}
Проект: ${request.boardName}

Соседние задачи в этой колонке:
${nearbyTasksText || '(пока нет соседних задач)'}

Улучши эту задачу и верни JSON.`

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `DeepSeek API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
      )
    }

    const data = await response.json()

    const content = data.choices?.[0]?.message?.content
    if (!content) {
      throw new Error('Empty response from DeepSeek API')
    }

    // Parse JSON response
    let parsed: AISuggestionResponse
    try {
      parsed = JSON.parse(content)
    } catch (e) {
      throw new Error(`Invalid JSON response: ${content}`)
    }

    // Validate response structure
    if (
      !parsed.improvedTitle ||
      !Array.isArray(parsed.acceptanceCriteria) ||
      !Array.isArray(parsed.risks)
    ) {
      throw new Error('Invalid response structure from DeepSeek API')
    }

    return parsed
  } catch (error) {
    console.error('Error generating AI suggestions:', error)
    throw error
  }
}
