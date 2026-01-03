'use client'

import { useState, useEffect } from 'react'
import { MetricCard } from '@/shared/ui/admin/MetricCard'
import { ChartCard } from '@/shared/ui/admin/ChartCard'
import {
  Server,
  Activity,
  HardDrive,
  Zap,
  AlertCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface SystemData {
  health: {
    uptime: string
    avgResponseTime: number
    storageUsed: string
    storageTotal: string
  }
  performance: {
    eventsPerHour: number
    p50: number
    p95: number
    p99: number
  }
  errors: {
    rate: string
    count: number
    logs: Array<{ timestamp: string; error: string; status: string }>
  }
  resources: {
    database: string
    auth: string
    storage: string
    functions: string
  }
  trends: {
    eventsIncreasing: boolean
    errorsIncreasing: boolean
    responseTimeStable: boolean
  }
}

export default function SystemPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d')
  const [data, setData] = useState<SystemData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/admin/analytics/system?range=${timeRange}`)
      if (!response.ok) throw new Error('Failed to fetch system data')
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

  // Auto-refresh every 30 seconds for system metrics
  useEffect(() => {
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [timeRange])

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

  const errorRate = parseFloat(data?.errors.rate || '0')
  const hasErrors = errorRate > 5 || (data?.errors.count ?? 0) > 0

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Система</h1>
          <p className="text-gray-400 mt-1">Метрики здоровья и производительности</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Activity size={14} className={loading ? '' : 'animate-pulse'} />
            Автообновление: 30 сек
          </div>
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
        </div>
      </div>

      {/* Error Alert */}
      {hasErrors && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <AlertCircle size={20} className="text-red-500" />
          <div>
            <p className="text-red-500 font-medium">Обнаружены ошибки: {data?.errors.count || 0}</p>
            <p className="text-gray-400 text-sm">Error rate: {data?.errors.rate || '0'}%</p>
          </div>
        </div>
      )}

      {/* Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Uptime"
          value={data?.health.uptime || '99.9%'}
          change={0}
          icon={Server}
          iconColor="#10b981"
        />
        <MetricCard
          title="Avg Response"
          value={`${data?.health.avgResponseTime || 0}ms`}
          change={0}
          icon={Zap}
          iconColor="#3b82f6"
        />
        <MetricCard
          title="События/час"
          value={data?.performance.eventsPerHour || 0}
          change={0}
          icon={Activity}
          iconColor={data?.trends.eventsIncreasing ? "#10b981" : "#8b5cf6"}
        />
        <MetricCard
          title="Error Rate"
          value={`${data?.errors.rate || '0'}%`}
          change={0}
          icon={AlertCircle}
          iconColor={errorRate > 5 ? "#ef4444" : "#10b981"}
        />
      </div>

      {/* Performance Percentiles */}
      <ChartCard
        title="Производительность API"
        description="Время ответа по перцентилям"
      >
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#121218] rounded-lg p-6 border border-gray-800 text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">{data?.performance.p50 || 0}</div>
            <div className="text-gray-400 text-sm">P50 (медиана)</div>
            <div className="text-gray-500 text-xs mt-1">ms</div>
          </div>
          <div className="bg-[#121218] rounded-lg p-6 border border-gray-800 text-center">
            <div className="text-3xl font-bold text-purple-500 mb-2">{data?.performance.p95 || 0}</div>
            <div className="text-gray-400 text-sm">P95</div>
            <div className="text-gray-500 text-xs mt-1">ms</div>
          </div>
          <div className="bg-[#121218] rounded-lg p-6 border border-gray-800 text-center">
            <div className="text-3xl font-bold text-pink-500 mb-2">{data?.performance.p99 || 0}</div>
            <div className="text-gray-400 text-sm">P99</div>
            <div className="text-gray-500 text-xs mt-1">ms</div>
          </div>
        </div>
      </ChartCard>

      {/* Resources Usage */}
      <ChartCard
        title="Использование ресурсов"
        description="Supabase сервисы"
      >
        <div className="space-y-3">
          {[
            { name: 'Database', value: data?.resources.database || '0%', color: 'bg-blue-500' },
            { name: 'Auth', value: data?.resources.auth || '0%', color: 'bg-green-500' },
            { name: 'Storage', value: data?.resources.storage || '0%', color: 'bg-purple-500' },
            { name: 'Functions', value: data?.resources.functions || '0%', color: 'bg-orange-500' }
          ].map((resource) => (
            <div key={resource.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{resource.name}</span>
                <span className="text-white font-medium">{resource.value}</span>
              </div>
              <div className="w-full h-2 bg-[#121218] rounded-full overflow-hidden">
                <div
                  className={`h-full ${resource.color} rounded-full transition-all`}
                  style={{ width: resource.value }}
                />
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Error Logs */}
      {data?.errors.logs && data.errors.logs.length > 0 && (
        <ChartCard
          title="Логи ошибок"
          description="Последние ошибки"
        >
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.errors.logs.map((log, index) => (
              <div key={index} className="flex items-start gap-3 bg-[#121218] rounded-lg p-3 border border-gray-800">
                <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-red-400 text-sm font-medium truncate">{log.error}</p>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      log.status === 'investigating' ? 'bg-yellow-500/20 text-yellow-400' :
                      log.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {log.status === 'investigating' ? 'Расследуется' : log.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      )}

      {/* Storage Info */}
      <ChartCard
        title="Хранилище"
        description="Использование дискового пространства"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <HardDrive size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-white font-medium">Supabase Storage</p>
              <p className="text-gray-400 text-sm">Файлы и медиа</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{data?.health.storageUsed || '0 GB'}</p>
            <p className="text-gray-400 text-sm">из {data?.health.storageTotal || '5 GB'}</p>
          </div>
        </div>
      </ChartCard>
    </div>
  )
}
