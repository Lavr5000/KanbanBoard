import { NextRequest, NextResponse } from 'next/server'
import { generateRoadmapChat } from '@/lib/deepseek'
import { requireAuth } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { trackAIUsage } from '@/lib/analytics/tracker'

const RATE_LIMIT = 10 // 10 requests per minute
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
    const { messages } = body

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid messages array' },
        { status: 400 }
      )
    }

    const response = await generateRoadmapChat(messages)

    // Track AI usage
    if (response.usage) {
      await trackAIUsage({
        model: 'deepseek-chat',
        operation: 'roadmap_generation',
        inputTokens: response.usage.inputTokens,
        outputTokens: response.usage.outputTokens,
        costUsd: 0.00014 * (response.usage.inputTokens + response.usage.outputTokens) / 1000 // DeepSeek pricing
      })
    }

    return NextResponse.json(response, {
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

    console.error('AI roadmap API error:', error)

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
      { error: 'Failed to generate roadmap' },
      { status: 500 }
    )
  }
}
