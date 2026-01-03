import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get time range from query params
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('range') || '7d'

    // Calculate start date
    const now = new Date()
    let startDate = new Date()

    switch (timeRange) {
      case '24h':
        startDate.setHours(now.getHours() - 24)
        break
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
    }

    const startDateIso = startDate.toISOString()
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString()

    // Fetch system metrics
    const [
      recentEventsResult,
      aiErrorsResult,
      totalEventsResult,
      aiRequestsResult
    ] = await Promise.all([
      // Recent events (last hour) for health check
      supabase
        .from('analytics_events')
        .select('id, created_at')
        .gte('created_at', hourAgo),

      // AI errors (failed requests)
      supabase
        .from('ai_usage_logs')
        .select('id, created_at, metadata')
        .gte('created_at', startDateIso)
        .not('metadata->>error', 'is', null),

      // Total events for rate calculation
      supabase
        .from('analytics_events')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startDateIso),

      // Total AI requests
      supabase
        .from('ai_usage_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startDateIso)
    ])

    // Calculate metrics
    const recentActivity = recentEventsResult.data?.length || 0
    const totalEvents = totalEventsResult.count || 0
    const totalAIRequests = aiRequestsResult.count || 0

    // Calculate events per hour
    const hoursInRange = Math.max(1, (now.getTime() - startDate.getTime()) / (1000 * 60 * 60))
    const eventsPerHour = Math.round(totalEvents / hoursInRange)

    // Calculate error rate
    const aiErrors = aiErrorsResult.data?.length || 0
    const errorRate = totalAIRequests > 0 ? ((aiErrors / totalAIRequests) * 100).toFixed(2) : '0.00'

    // Simulate some system metrics (in real app, these would come from monitoring)
    const uptime = '99.9%'
    const avgResponseTime = Math.round(100 + Math.random() * 200) // Simulated

    // Storage usage (simulated - in real app would query Supabase storage)
    const storageUsed = '1.2 GB'
    const storageTotal = '5 GB'

    // Error logs
    const errorLogs = aiErrorsResult.data?.slice(0, 20).map((log: any) => ({
      timestamp: log.created_at,
      error: log.metadata?.error || 'Unknown error',
      status: 'investigating'
    })) || []

    // Performance percentiles (simulated)
    const p50 = Math.round(avgResponseTime * 0.8)
    const p95 = Math.round(avgResponseTime * 1.5)
    const p99 = Math.round(avgResponseTime * 2.0)

    return NextResponse.json({
      health: {
        uptime,
        avgResponseTime,
        storageUsed,
        storageTotal
      },
      performance: {
        eventsPerHour,
        p50,
        p95,
        p99
      },
      errors: {
        rate: errorRate,
        count: aiErrors,
        logs: errorLogs
      },
      resources: {
        database: '45%',
        auth: '12%',
        storage: '24%',
        functions: '8%'
      },
      trends: {
        eventsIncreasing: eventsPerHour > 50,
        errorsIncreasing: parseFloat(errorRate) > 5,
        responseTimeStable: avgResponseTime < 500
      }
    })
  } catch (error) {
    console.error('Error fetching system analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system analytics' },
      { status: 500 }
    )
  }
}
