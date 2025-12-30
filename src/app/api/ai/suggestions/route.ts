import { NextRequest, NextResponse } from 'next/server'
import { generateTaskSuggestions, type AISuggestionRequest } from '@/lib/deepseek'

export async function POST(request: NextRequest) {
  try {
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

    return NextResponse.json(suggestions)
  } catch (error) {
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
