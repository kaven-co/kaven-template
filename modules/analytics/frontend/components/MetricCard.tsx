// Kaven Analytics Module — MetricCard
// Card reutilizável com valor numérico e indicador de tendência.

interface MetricCardProps {
  label: string
  value: number
  trend?: 'up' | 'down' | 'neutral'
}

export function MetricCard({ label, value, trend }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value.toLocaleString()}</p>
      {trend && (
        <span
          className={`text-xs ${
            trend === 'up'
              ? 'text-green-600'
              : trend === 'down'
                ? 'text-red-600'
                : 'text-gray-500'
          }`}
        >
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
        </span>
      )}
    </div>
  )
}
