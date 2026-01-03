'use client'

import { useState, useEffect } from 'react'
import { MetricCard } from '@/shared/ui/admin/MetricCard'
import { ChartCard } from '@/shared/ui/admin/ChartCard'
import {
  DollarSign,
  TrendingUp,
  Zap,
  BarChart3,
  Download,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface AIAnalyticsData {
  totalRequests: number
  totalCost: string
  avgCost: string
  modelBreakdown: Array<{ model: string; requests: number; cost: string; avgCost: string }>
  topUsers: Array<{ userId: string; requests: number; cost: string }>
  costForecast: Array<{ date: string; cost: string; predicted: boolean }>
}

export default function AIAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d')
  const [data, setData] = useState<AIAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/admin/analytics/ai?range=${timeRange}`)
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

  const handleExportCSV = () => {
    if (!data) return

    const rows = [
      ['Model', 'Requests', 'Cost ($)', 'Avg Cost ($)'],
      ...data.modelBreakdown.map(m => [m.model, m.requests.toString(), m.cost, m.avgCost])
    ]

    const csv = rows.map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-analytics-${timeRange}.csv`
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

  // Prepare chart data
  const modelBreakdownChart = data?.modelBreakdown.map(m => ({
    model: m.model.replace('deepseek-', '').replace('chat', 'DeepSeek'),
    requests: m.requests,
    cost: parseFloat(m.cost)
  })) || []

  const costForecastChart = data?.costForecast.map(f => ({
    date: f.date,
    actual: f.predicted ? null : parseFloat(f.cost),
    forecast: f.predicted ? parseFloat(f.cost) : null
  })) || []

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Аналитика</h1>
          <p className="text-gray-400 mt-1">Детальная статистика использования AI</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
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
          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a20] text-gray-300 rounded-lg border border-gray-800 hover:border-gray-700 transition-all"
          >
            <Download size={16} />
            Экспорт CSV
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Всего запросов AI"
          value={data?.totalRequests.toString() || '0'}
          change={0}
          icon={BarChart3}
          iconColor="#3b82f6"
        />
        <MetricCard
          title="Общая стоимость"
          value={`$${data?.totalCost || '0'}`}
          change={0}
          icon={DollarSign}
          iconColor="#10b981"
        />
        <MetricCard
          title="Средняя стоимость"
          value={`$${data?.avgCost || '0'}`}
          change={0}
          icon={TrendingUp}
          iconColor="#8b5cf6"
        />
        <MetricCard
          title="Эффективность"
          value="95%+"
          change={0}
          icon={Zap}
          iconColor="#06b6d4"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Breakdown */}
        <ChartCard
          title="Стоимость по моделям"
          description="Расходы на различные AI модели"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={modelBreakdownChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="model" stroke="#9ca3af" angle={-20} textAnchor="end" height={60} />
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
              <Bar dataKey="requests" name="Запросы" fill="#3b82f6" />
              <Bar dataKey="cost" name="Стоимость ($)" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Cost Forecast */}
        <ChartCard
          title="Прогноз расходов"
          description="Фактические и прогнозируемые затраты"
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={costForecastChart}>
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
              <Line
                type="monotone"
                dataKey="actual"
                name="Фактические"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                name="Прогноз"
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#8b5cf6' }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top AI Users Table */}
      <ChartCard
        title="Топ пользователей по AI"
        description="Наибольшее использование AI"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase font-bold tracking-wider">
                  Пользователь
                </th>
                <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase font-bold tracking-wider">
                  Запросы
                </th>
                <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase font-bold tracking-wider">
                  Стоимость
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.topUsers && data.topUsers.length > 0 ? (
                data.topUsers.map((user, index) => (
                  <tr key={index} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4 text-white font-medium">{user.userId.slice(0, 8)}...</td>
                    <td className="py-3 px-4 text-gray-400">{user.requests}</td>
                    <td className="py-3 px-4 text-green-400 font-medium">${user.cost}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-500">
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
