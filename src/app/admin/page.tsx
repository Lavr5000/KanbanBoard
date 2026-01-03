'use client'

import { useEffect, useState } from 'react'
import { MetricCard } from '@/shared/ui/admin/MetricCard'
import { ChartCard } from '@/shared/ui/admin/ChartCard'
import {
  Users,
  Activity,
  DollarSign,
  BarChart3
} from 'lucide-react'
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface AnalyticsData {
  activeUsers: number
  totalTasks: number
  aiRequestsToday: number
  aiCostMonth: string
  activityData: Array<{ date: string; users: number; tasks: number }>
  aiUsageByType: Record<string, number>
  topProjects: Array<{ name: string; tasks: number; aiRequests: number; users: number }>
}

const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']

export default function AdminPage() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/admin/analytics/overview?range=${timeRange}`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
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

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [autoRefresh, timeRange])

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

  // Russian names for AI operations
  const aiOperationNames: Record<string, string> = {
    roadmap_generation: 'Дорожная карта',
    suggestion_generation: 'Улучшение задач',
    task_creation: 'Создание задач',
    chat: 'Чат с AI'
  }

  // Format AI usage data for pie chart
  const aiUsageData = Object.entries(data?.aiUsageByType || {}).map(([name, value], index) => ({
    name: aiOperationNames[name] || (name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ')),
    value,
    color: colors[index % colors.length]
  }))

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Обзор</h1>
          <p className="text-gray-400 mt-1">Ключевые метрики и активность</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex gap-1 bg-[#1a1a20] rounded-lg p-1 border border-gray-800">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  timeRange === range
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {range === '24h' ? '24ч' : range === '7d' ? '7д' : '30д'}
              </button>
            ))}
          </div>
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
              autoRefresh
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : 'bg-[#1a1a20] text-gray-400 border-gray-800'
            }`}
          >
            <Activity size={14} className={autoRefresh ? 'animate-pulse' : ''} />
            Автообновление
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Активные пользователи"
          value={data?.activeUsers.toString() || '0'}
          change={0}
          icon={Users}
          iconColor="#3b82f6"
        />
        <MetricCard
          title="Всего задач"
          value={data?.totalTasks.toString() || '0'}
          change={0}
          icon={BarChart3}
          iconColor="#8b5cf6"
        />
        <MetricCard
          title="AI запросов сегодня"
          value={data?.aiRequestsToday.toString() || '0'}
          change={0}
          icon={Activity}
          iconColor="#06b6d4"
        />
        <MetricCard
          title="Расходы AI (месяц)"
          value={`$${data?.aiCostMonth || '0.00'}`}
          change={0}
          icon={DollarSign}
          iconColor="#10b981"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Chart */}
        <ChartCard
          title="Активность пользователей"
          description="Количество пользователей и созданных задач"
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data?.activityData || []}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a20',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="users"
                name="Пользователи"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorUsers)"
              />
              <Area
                type="monotone"
                dataKey="tasks"
                name="Задачи"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#colorTasks)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* AI Usage Chart */}
        <ChartCard
          title="Использование AI"
          description="Распределение по типам операций"
        >
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={aiUsageData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {aiUsageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a20',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top Projects Table */}
      <ChartCard title="Топ проектов" description="По количеству задач и AI запросов">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase font-bold tracking-wider">
                  Проект
                </th>
                <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase font-bold tracking-wider">
                  Задачи
                </th>
                <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase font-bold tracking-wider">
                  AI запросы
                </th>
                <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase font-bold tracking-wider">
                  Пользователи
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.topProjects && data.topProjects.length > 0 ? (
                data.topProjects.map((project, index) => (
                  <tr key={index} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4 text-white font-medium">{project.name}</td>
                    <td className="py-3 px-4 text-gray-400">{project.tasks}</td>
                    <td className="py-3 px-4">
                      <span className="text-purple-400 font-medium">{project.aiRequests}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{project.users}</td>
                  </tr>
                ))
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
