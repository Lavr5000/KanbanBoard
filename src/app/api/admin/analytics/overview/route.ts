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

    // Fetch analytics data in parallel
    const [
      activeUsersResult,
      totalTasksResult,
      aiRequestsResult,
      aiCostResult,
      activityDataResult
    ] = await Promise.all([
      // Active users count
      supabase
        .from('analytics_events')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', startDateIso),

      // Total tasks created
      supabase
        .from('analytics_events')
        .select('id', { count: 'exact', head: true })
        .eq('event_type', 'task_created')
        .gte('created_at', startDateIso),

      // AI requests today
      supabase
        .from('ai_usage_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(now.setHours(0, 0, 0, 0)).toISOString()),

      // AI costs this month
      supabase
        .from('ai_usage_logs')
        .select('cost_usd')
        .gte('created_at', new Date(now.getFullYear(), now.getMonth(), 1).toISOString()),

      // User activity over time (daily) - use RPC function
      supabase.rpc('get_daily_activity_v2', { start_date: startDateIso })
    ])

    // Calculate AI cost
    let aiCost = 0
    if (!aiCostResult.error && aiCostResult.data) {
      aiCost = aiCostResult.data.reduce((sum: number, log: any) => sum + (log.cost_usd || 0), 0)
    }

    // Get AI usage by type
    const { data: aiUsageData } = await supabase
      .from('ai_usage_logs')
      .select('operation')
      .gte('created_at', startDateIso)

    const aiUsageByType: Record<string, number> = {}
    if (aiUsageData) {
      aiUsageData.forEach((log) => {
        const operation = log.operation || 'other'
        aiUsageByType[operation] = (aiUsageByType[operation] || 0) + 1
      })
    }

    // Format activity data
    const activityData = activityDataResult.data || []

    // Get top projects (boards)
    const { data: boardsData } = await supabase
      .from('analytics_events')
      .select('properties')
      .eq('event_type', 'task_created')
      .gte('created_at', startDateIso)

    // Aggregate board stats
    const boardStats: Record<string, { tasks: number; aiRequests: number; users: Set<string> }> = {}
    boardsData?.forEach((event) => {
      const boardId = event.properties?.board_id
      if (boardId) {
        if (!boardStats[boardId]) {
          boardStats[boardId] = { tasks: 0, aiRequests: 0, users: new Set() }
        }
        boardStats[boardId].tasks++
      }
    })

    const topProjects = Object.entries(boardStats)
      .map(([id, stats]) => ({
        name: `Project ${id.slice(0, 8)}`,
        tasks: stats.tasks,
        aiRequests: stats.aiRequests,
        users: stats.users.size
      }))
      .sort((a, b) => b.tasks - a.tasks)
      .slice(0, 5)

    return NextResponse.json({
      activeUsers: activeUsersResult.count || 0,
      totalTasks: totalTasksResult.count || 0,
      aiRequestsToday: aiRequestsResult.count || 0,
      aiCostMonth: aiCost.toFixed(2),
      activityData,
      aiUsageByType,
      topProjects
    })
  } catch (error) {
    console.error('Error fetching overview analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
