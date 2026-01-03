'use client'

import { useState, useEffect } from 'react'
import { MetricCard } from '@/shared/ui/admin/MetricCard'
import { ChartCard } from '@/shared/ui/admin/ChartCard'
import {
  Users,
  UserPlus,
  Activity,
  Clock,
  Download,
  AlertTriangle
} from 'lucide-react'

interface UsersData {
  totalUsers: number
  newUsers: number
  activeToday: number
  avgSessionTime: number
  users: Array<{
    userId: string
    email: string
    lastActivity: string
    actionsCount: number
    status: 'active' | 'at-risk' | 'inactive'
  }>
}

export default function UsersPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d')
  const [data, setData] = useState<UsersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/admin/analytics/users?range=${timeRange}`)
      if (!response.ok) throw new Error('Failed to fetch users data')
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [timeRange])

  const handleExportCSV = () => {
    if (!data) return

    const rows = [
      ['Email', 'Last Activity', 'Actions Count', 'Status'],
      ...data.users.map(u => [
        u.email,
        new Date(u.lastActivity).toLocaleString(),
        u.actionsCount.toString(),
        u.status
      ])
    ]

    const csv = rows.map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-analytics-${timeRange}.csv`
    a.click()
  }

  if (loading && !data) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-400">Загрузка...</div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-red-400">Ошибка: {error}</div>
      </div>
    )
  }

  const atRiskCount = data?.users.filter(u => u.status === 'at-risk').length || 0
  const activeCount = data?.users.filter(u => u.status === 'active').length || 0

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Пользователи</h1>
          <p className="text-gray-400 mt-1">Аналитика активности и удержания</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-[#1a1a20] rounded-lg p-1 border border-gray-800">
            {(['7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  timeRange === range
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {range === '7d' ? '7 дней' : '30 дней'}
              </button>
            ))}
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a20] text-gray-300 rounded-lg border border-gray-800 hover:border-gray-700 transition-all"
          >
            <Download size={16} />
            Экспорт CSV
          </button>
        </div>
      </div>

      {/* Risk Alert */}
      {atRiskCount > 0 && (
        <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <AlertTriangle size={20} className="text-yellow-500" />
          <div>
            <p className="text-yellow-500 font-medium">{atRiskCount} пользователей в зоне риска</p>
            <p className="text-gray-400 text-sm">Нет активности более 7 дней</p>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Всего пользователей"
          value={data?.totalUsers.toString() || '0'}
          change={0}
          icon={Users}
          iconColor="#3b82f6"
        />
        <MetricCard
          title="Новых пользователей"
          value={`+${data?.newUsers.toString() || '0'}`}
          change={0}
          icon={UserPlus}
          iconColor="#10b981"
        />
        <MetricCard
          title="Активно сегодня"
          value={data?.activeToday.toString() || '0'}
          change={0}
          icon={Activity}
          iconColor="#06b6d4"
        />
        <MetricCard
          title="Средняя сессия"
          value={`${data?.avgSessionTime || 0} мин`}
          change={0}
          icon={Clock}
          iconColor="#8b5cf6"
        />
      </div>

      {/* Users Table */}
      <ChartCard
        title="Список пользователей"
        description="Активность за выбранный период"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase font-bold tracking-wider">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase font-bold tracking-wider">
                  Последняя активность
                </th>
                <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase font-bold tracking-wider">
                  Действия
                </th>
                <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase font-bold tracking-wider">
                  Статус
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.users && data.users.length > 0 ? (
                data.users.map((user, index) => {
                  const lastActive = new Date(user.lastActivity)
                  const daysSinceActive = Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24))

                  return (
                    <tr key={index} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="py-3 px-4 text-white font-medium">{user.email}</td>
                      <td className="py-3 px-4 text-gray-400">
                        {daysSinceActive === 0 ? 'Сегодня' : daysSinceActive === 1 ? 'Вчера' : `${daysSinceActive} дн. назад`}
                      </td>
                      <td className="py-3 px-4 text-gray-400">{user.actionsCount}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          user.status === 'at-risk' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {user.status === 'active' ? 'Активен' : user.status === 'at-risk' ? 'Риск' : 'Неактивен'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    Нет данных за выбранный период
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}
