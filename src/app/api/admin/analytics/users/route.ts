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
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayStartIso = todayStart.toISOString()

    // Fetch user analytics data using RPC functions for accurate counts
    const [
      totalUsersResult,
      newUsersResult,
      activeTodayResult,
      avgSessionTimeResult,
      usersWithActivityResult
    ] = await Promise.all([
      // Total users from auth.users (accurate count)
      supabase.rpc('get_total_users_count'),

      // New users in period
      supabase.rpc('get_new_users_count', { p_start_date: startDateIso }),

      // Unique active users today
      supabase.rpc('get_unique_active_users_count', { p_start_date: todayStartIso }),

      // Average session time (from user_sessions)
      supabase
        .from('user_sessions')
        .select('duration_seconds')
        .not('duration_seconds', 'is', null)
        .gte('started_at', startDateIso),

      // Get all users with their activity stats
      supabase.rpc('get_users_with_activity', { p_start_date: startDateIso })
    ])

    // Calculate average session time
    let avgSessionTime = 0
    if (!avgSessionTimeResult.error && avgSessionTimeResult.data) {
      const sessions = avgSessionTimeResult.data as { duration_seconds: number }[]
      const total = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0)
      avgSessionTime = sessions.length > 0 ? total / sessions.length : 0
    }

    // Process users with activity
    interface UserWithActivity {
      user_id: string
      email: string | null
      full_name: string | null
      user_created_at: string
      last_activity: string | null
      actions_count: number
    }

    const usersData = (usersWithActivityResult.data || []) as UserWithActivity[]

    // Convert to array and determine status
    const users = usersData.map(user => {
      const lastActive = user.last_activity ? new Date(user.last_activity) : null
      const daysSinceActive = lastActive
        ? Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
        : 999 // Never active

      let status: 'active' | 'at-risk' | 'inactive' = 'inactive'
      if (lastActive) {
        if (daysSinceActive <= 7) {
          status = 'active'
        } else if (daysSinceActive <= 30) {
          status = 'at-risk'
        } else {
          status = 'inactive'
        }
      }

      // Format email display
      const displayEmail = user.email || `user-${user.user_id.slice(0, 8)}`

      return {
        userId: user.user_id,
        email: displayEmail,
        fullName: user.full_name,
        lastActivity: user.last_activity || user.user_created_at,
        actionsCount: user.actions_count || 0,
        status
      }
    })

    // Sort by actions count (most active first), then by last activity
    users.sort((a, b) => {
      if (b.actionsCount !== a.actionsCount) {
        return b.actionsCount - a.actionsCount
      }
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    })

    return NextResponse.json({
      totalUsers: totalUsersResult.data || 0,
      newUsers: newUsersResult.data || 0,
      activeToday: activeTodayResult.data || 0,
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
