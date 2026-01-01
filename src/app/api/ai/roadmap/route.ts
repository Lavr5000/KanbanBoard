import { NextRequest, NextResponse } from 'next/server'
import { generateRoadmapChat } from '@/lib/deepseek'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages } = body

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid messages array' },
        { status: 400 }
      )
    }

    const response = await generateRoadmapChat(messages)

    return NextResponse.json(response)
  } catch (error) {
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
