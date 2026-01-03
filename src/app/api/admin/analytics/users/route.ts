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
    const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString()

    // Fetch user analytics data
    const [
      totalUsersResult,
      newUsersResult,
      activeTodayResult,
      avgSessionTimeResult,
      recentActivityResult
    ] = await Promise.all([
      // Total users
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true }),

      // New users in period
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startDateIso),

      // Active users today (from analytics_events)
      supabase
        .from('analytics_events')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', todayStart),

      // Average session time (from user_sessions)
      supabase
        .from('user_sessions')
        .select('duration_seconds')
        .not('duration_seconds', 'is', null)
        .gte('started_at', startDateIso),

      // Recent activity for user list
      supabase
        .from('analytics_events')
        .select('user_id, event_type, created_at')
        .gte('created_at', startDateIso)
        .order('created_at', { ascending: false })
        .limit(100)
    ])

    // Calculate average session time
    let avgSessionTime = 0
    if (!avgSessionTimeResult.error && avgSessionTimeResult.data) {
      const total = avgSessionTimeResult.data.reduce((sum: number, s: any) => sum + (s.duration_seconds || 0), 0)
      avgSessionTime = avgSessionTimeResult.data.length > 0 ? total / avgSessionTimeResult.data.length : 0
    }

    // Aggregate user activity
    const userActivity: Record<string, {
      userId: string
      email: string
      lastActivity: string
      actionsCount: number
      events: string[]
    }> = {}

    if (!recentActivityResult.error && recentActivityResult.data) {
      recentActivityResult.data.forEach((event: any) => {
        const userId = event.user_id || 'unknown'
        if (!userActivity[userId]) {
          userActivity[userId] = {
            userId,
            email: 'Неизвестный',
            lastActivity: event.created_at,
            actionsCount: 0,
            events: []
          }
        }
        userActivity[userId].actionsCount++
        userActivity[userId].events.push(event.event_type)

        // Update last activity if newer
        if (event.created_at > userActivity[userId].lastActivity) {
          userActivity[userId].lastActivity = event.created_at
        }
      })
    }

    // Fetch email addresses for all users
    const userIds = Object.keys(userActivity)
    const userEmails: Record<string, string> = {}

    if (userIds.length > 0) {
      // Get emails from auth.users (we need to use service role or join with public.users)
      const { data: usersData } = await supabase
        .from('users')
        .select('id, email')
        .in('id', userIds)

      if (usersData) {
        usersData.forEach((u: any) => {
          userEmails[u.id] = u.email || u.id.slice(0, 8) + '...'
        })
      }

      // Update emails in userActivity
      Object.keys(userActivity).forEach(userId => {
        userActivity[userId].email = userEmails[userId] || userId.slice(0, 8) + '...'
      })
    }

    // Convert to array and determine status
    const users = Object.values(userActivity).map(user => {
      const lastActive = new Date(user.lastActivity)
      const daysSinceActive = Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24))

      let status = 'active'
      if (daysSinceActive > 7) {
        status = 'at-risk'
      } else if (daysSinceActive > 30) {
        status = 'inactive'
      }

      return {
        userId: user.userId,
        email: user.email,
        lastActivity: user.lastActivity,
        actionsCount: user.actionsCount,
        status
      }
    })

    // Sort by actions count
    users.sort((a, b) => b.actionsCount - a.actionsCount)

    return NextResponse.json({
      totalUsers: totalUsersResult.count || 0,
      newUsers: newUsersResult.count || 0,
      activeToday: activeTodayResult.count || 0,
      avgSessionTime: Math.round(avgSessionTime / 60), // Convert to minutes
      users
    })
  } catch (error) {
    console.error('Error fetching users analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users analytics' },
      { status: 500 }
    )
  }
}
