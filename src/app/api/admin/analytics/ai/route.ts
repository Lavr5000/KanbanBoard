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

    // Fetch AI analytics data
    const [
      totalRequestsResult,
      totalCostResult,
      avgCostResult,
      usageByModelResult,
      usageByUserResult,
      costOverTimeResult
    ] = await Promise.all([
      // Total AI requests
      supabase
        .from('ai_usage_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startDateIso),

      // Total cost
      supabase
        .from('ai_usage_logs')
        .select('cost_usd'),

      // Average cost per request
      supabase.rpc('avg_ai_cost', {
        start_date: startDateIso
      }),

      // Usage by model
      supabase
        .from('ai_usage_logs')
        .select('model')
        .gte('created_at', startDateIso),

      // Usage by user (top)
      supabase
        .from('ai_usage_logs')
        .select('user_id')
        .gte('created_at', startDateIso),

      // Cost over time (daily)
      supabase
        .from('ai_usage_logs')
        .select('created_at, cost_usd, total_tokens')
        .gte('created_at', startDateIso)
        .order('created_at', { ascending: true })
    ])

    // Calculate total cost
    let totalCost = 0
    if (!totalCostResult.error && totalCostResult.data) {
      totalCost = totalCostResult.data.reduce((sum: number, log: any) => sum + (log.cost_usd || 0), 0)
    }

    // Calculate avg cost
    const totalRequests = totalRequestsResult.count || 0
    const avgCost = totalRequests > 0 ? totalCost / totalRequests : 0

    // Aggregate by model
    const modelStats: Record<string, { requests: number; cost: number; tokens: number }> = {}
    if (!usageByModelResult.error && usageByModelResult.data) {
      // Get detailed data for each model
      const { data: detailedData } = await supabase
        .from('ai_usage_logs')
        .select('*')
        .gte('created_at', startDateIso)

      detailedData?.forEach((log: any) => {
        const model = log.model || 'unknown'
        if (!modelStats[model]) {
          modelStats[model] = { requests: 0, cost: 0, tokens: 0 }
        }
        modelStats[model].requests++
        modelStats[model].cost += log.cost_usd || 0
        modelStats[model].tokens += log.total_tokens || 0
      })
    }

    const modelBreakdown = Object.entries(modelStats).map(([model, stats]) => ({
      model,
      requests: stats.requests,
      cost: stats.cost.toFixed(4),
      avgCost: (stats.cost / stats.requests).toFixed(6)
    }))

    // Aggregate by user
    const userStats: Record<string, { requests: number; cost: number }> = {}
    if (!usageByUserResult.error && usageByUserResult.data) {
      const { data: detailedUserData } = await supabase
        .from('ai_usage_logs')
        .select('user_id, cost_usd, total_tokens')
        .gte('created_at', startDateIso)

      detailedUserData?.forEach((log: any) => {
        const userId = log.user_id || 'unknown'
        if (!userStats[userId]) {
          userStats[userId] = { requests: 0, cost: 0 }
        }
        userStats[userId].requests++
        userStats[userId].cost += log.cost_usd || 0
      })
    }

    const topUsers = Object.entries(userStats)
      .map(([userId, stats]) => ({
        userId,
        requests: stats.requests,
        cost: stats.cost.toFixed(4)
      }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10)

    // Aggregate cost over time by day
    const costByDay: Record<string, number> = {}
    if (!costOverTimeResult.error && costOverTimeResult.data) {
      costOverTimeResult.data.forEach((log: any) => {
        const day = new Date(log.created_at).toISOString().split('T')[0]
        costByDay[day] = (costByDay[day] || 0) + (log.cost_usd || 0)
      })
    }

    const costForecast = Object.entries(costByDay).map(([date, cost]) => ({
      date: new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
      cost: cost.toFixed(4),
      predicted: false
    }))

    // Add simple forecast (last 7 days average)
    if (costForecast.length > 0) {
      const last7Days = costForecast.slice(-7)
      const avgDailyCost = last7Days.reduce((sum, day) => sum + parseFloat(day.cost), 0) / last7Days.length

      // Forecast next 7 days
      const lastDate = new Date(costForecast[costForecast.length - 1].date.split('.').reverse().join('-'))
      for (let i = 1; i <= 7; i++) {
        const nextDate = new Date(lastDate)
        nextDate.setDate(lastDate.getDate() + i)
        costForecast.push({
          date: nextDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
          cost: avgDailyCost.toFixed(4),
          predicted: true
        })
      }
    }

    return NextResponse.json({
      totalRequests: totalRequests || 0,
      totalCost: totalCost.toFixed(2),
      avgCost: avgCost.toFixed(6),
      modelBreakdown,
      topUsers,
      costForecast
    })
  } catch (error) {
    console.error('Error fetching AI analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI analytics' },
      { status: 500 }
    )
  }
}
