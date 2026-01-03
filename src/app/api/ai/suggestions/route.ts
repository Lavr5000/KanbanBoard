import { NextRequest, NextResponse } from 'next/server'
import { generateTaskSuggestions, type AISuggestionRequest } from '@/lib/deepseek'
import { requireAuth } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { trackAIUsage, trackAISuggestionUsed } from '@/lib/analytics/tracker'

const RATE_LIMIT = 20 // 20 requests per minute for suggestions
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await requireAuth()

    // Check rate limit
    const rateLimit = checkRateLimit(user.id, RATE_LIMIT, RATE_LIMIT_WINDOW)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          },
        }
      )
    }

    const body = await request.json()

    // Validate request body
    const { taskContent, columnTitle, boardName, nearbyTasks = [] } = body

    if (!taskContent || !columnTitle || !boardName) {
      return NextResponse.json(
        { error: 'Missing required fields: taskContent, columnTitle, boardName' },
        { status: 400 }
      )
    }

    const aiRequest: AISuggestionRequest = {
      taskContent,
      columnTitle,
      boardName,
      nearbyTasks,
    }

    const suggestions = await generateTaskSuggestions(aiRequest)

    // Track AI usage
    if (suggestions.usage) {
      await trackAIUsage({
        model: 'deepseek-chat',
        operation: 'suggestion_generation',
        inputTokens: suggestions.usage.inputTokens,
        outputTokens: suggestions.usage.outputTokens,
        costUsd: 0.00014 * (suggestions.usage.inputTokens + suggestions.usage.outputTokens) / 1000
      })
    }

    // Track suggestion used event
    await trackAISuggestionUsed('N/A', 'N/A')

    return NextResponse.json(suggestions, {
      headers: {
        'X-RateLimit-Limit': RATE_LIMIT.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
      },
    })
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('AI suggestions API error:', error)

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('DEEPSEEK_API_KEY is not set')) {
        return NextResponse.json(
          { error: 'AI service not configured' },
          { status: 500 }
        )
      }

      if (error.message.includes('DeepSeek API error: 429')) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate AI suggestions' },
      { status: 500 }
    )
  }
}
