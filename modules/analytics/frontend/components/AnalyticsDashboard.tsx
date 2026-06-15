'use client'
// Kaven Analytics Module — AnalyticsDashboard
// Widget admin: total de eventos, eventos nos últimos 30 dias e top 5 eventos do tenant.

import { useEffect, useState } from 'react'
import { MetricCard } from './MetricCard'

interface DashboardMetrics {
  totalEvents: number
  recentEvents: number
  topEvents: Array<{ event: string; count: number }>
}

export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/dashboard')
      .then(r => r.json())
      .then(data => {
        setMetrics(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="animate-pulse h-32 bg-gray-100 rounded-lg" />
  if (!metrics) return null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="Total Events" value={metrics.totalEvents} />
        <MetricCard label="Last 30 Days" value={metrics.recentEvents} trend="up" />
      </div>
      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Top Events (30d)</h3>
        <ul className="space-y-2">
          {metrics.topEvents.map(({ event, count }) => (
            <li key={event} className="flex justify-between text-sm">
              <span className="text-gray-600">{event}</span>
              <span className="font-medium">{count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
