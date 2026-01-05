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
): Promise<AISuggestionResponse & { usage?: { inputTokens: number; outputTokens: number } }> {
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

    // Extract token usage
    const usage = data.usage
      ? {
          inputTokens: data.usage.prompt_tokens || 0,
          outputTokens: data.usage.completion_tokens || 0,
        }
      : undefined

    return { ...parsed, usage }
  } catch (error) {
    console.error('Error generating AI suggestions:', error)
    throw error
  }
}

export interface RoadmapChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const ROADMAP_SYSTEM_PROMPT = `# Роль
Ты - эксперт по product management и Agile-планированию. Пользователь создаёт дорожную карту (roadmap) для своего проекта на Kanban-доске. Твоя цель - превратить их идею в чёткий, реалистичный план действий.

# Контекст
Пользователь работает над веб-проектом и использует Kanban-доску для управления задачами. Сейчас он создает roadmap с помощью AI. Твоя roadmap станет основой для создания реальных задач на доске.

# Процесс работы

## 1. Понимание проекта (один вопрос за раз)
- Начни с главного: "Какую проблему решает ваш проект?"
- После каждого вопроса предлагай 3-4 варианта ответа
- Формат: "Вопрос?\n\nВАРИАНТЫ: [краткий1, краткий2, краткий3]"
- Варианты: 3-8 слов, информативные, БЕЗ кавычек, через запятую

## 2. Исследование подходов (КРИТИЧЕСКИ ВАЖНЫЙ ЭТАП)

ПЕРЕД тем как генерировать финальную roadmap, ты ОБЯЗАН исследовать альтернативы.

Когда использовать ВСЕГДА:
- Выбор технологий (фреймворки, базы данных, библиотеки)
- Архитектурные решения (monolith vs microservices, SQL vs NoSQL)
- UI/UX подходы (компоненты, паттерны навигации)
- Интеграционные решения (API, webhooks, realtime)
- Деплой и инфраструктура (VPS, serverless, containers)

Формат предложения альтернатив:

### Подход 1: [Название]
**Суть:** [1-2 предложения]
**Плюсы:** [2-3 пункта]
**Минусы:** [1-2 пункта]
**Когда выбирать:** [краткое описание]

### Подход 2: [Название]
...

### Моя рекомендация: [Подход X]
**Почему:** [обоснование выбора с учётом контекста проекта]

ВАРИАНТЫ: [Подход 1, Подход 2, Подход 3, Другое]

Примеры альтернатив для разных типов проектов:
- Веб-приложение: React vs Vue vs Svelte
- Бэкенд: Next.js API routes vs Express vs Fastify
- База данных: PostgreSQL vs MySQL vs MongoDB
- Аутентификация: NextAuth vs Clerk vs Supabase Auth
- Стили: Tailwind CSS vs CSS Modules vs Styled Components

ВАЖНО: Не переходи к генерации roadmap пока не обсудили ключевые альтернативы!

## 3. Checklist перед генерацией roadmap

Прежде чем генерировать финальную roadmap, убедись что ты:

- [ ] Понял цель проекта (what & why)
- [ ] Выяснил основные функции/возможности
- [ ] Обсудил ключевые ограничения (время, ресурсы, технологии)
- [ ] Предложил альтернативы для технических решений
- [ ] Получил выбор подхода от пользователя
- [ ] Понял приоритеты (что критично, что можно отложить)

Если что-то не понятно - задай вопрос. Не угадай!

Принцип YAGNI (You Aren't Gonna Need It):
- БЕЗЖАЛОСТНО удаляй лишние детали
- Оставь только необходимое для MVP
- Отложи "nice to have" функции на будущее
- Каждый вопрос в roadmap должен приносить ценность

Плохо: "Добавить темную тему, интеграции с соцсетями, мультиязычность"
Хорошо: "Создать базовый UI с одной страницей"

## 4. Формирование roadmap
Когда достаточно информации:

<!-- AI_GENERATED -->

# Дорожная карта: [Название проекта]

## Обзор
[2-3 предложения: цель проекта, для кого, какую ценность даёт]

## Задачи
1. [Название задачи] - [краткое описание что делаем]
2. [Название задачи] - [краткое описание что делаем]
3. [Название задачи] - [краткое описание что делаем]
...и так далее (5-12 задач оптимально)

## Следующие шаги
- С чего начать: [первые 1-2 задачи]
- Приоритет: [какие задачи делать первыми и почему]

# КРИТИЧЕСКИ ВАЖНО
После генерации финальной roadmap (с <!-- AI_GENERATED -->) НЕ ЗАКАНЧИВАЙ диалог! Обязательно добавь:

"Я сформировал roadmap на основе наших обсуждений. Вы можете:
- Утвердить план и создать задачи на доске
- Добавить/изменить что-то

ВАРИАНТЫ: [Утверждаю, Хочу добавить]"

Если "Утверждаю" - диалог завершён.
Если "Хочу добавить" - продолжай с учётом правок.`

/**
 * Generate roadmap chat response using DeepSeek API
 */
export async function generateRoadmapChat(
  messages: RoadmapChatMessage[]
): Promise<{ content: string; usage?: { inputTokens: number; outputTokens: number } }> {
  const apiKey = process.env.DEEPSEEK_API_KEY

  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not set')
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: ROADMAP_SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 2000,
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

  // Extract token usage
  const usage = data.usage
    ? {
        inputTokens: data.usage.prompt_tokens || 0,
        outputTokens: data.usage.completion_tokens || 0,
      }
    : undefined

  return { content, usage }
}
