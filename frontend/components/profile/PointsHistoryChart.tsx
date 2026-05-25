'use client'

import { useMemo } from 'react'
import { format, startOfDay, eachDayOfInterval, subDays } from 'date-fns'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { RewardActivity } from '@/types/Rewards'

interface PointsHistoryChartProps {
  history: RewardActivity[]
}

interface ChartDataPoint {
  date: string
  dateLabel: string
  dailyPoints: number
  cumulativePoints: number
}

export const PointsHistoryChart = ({ history }: PointsHistoryChartProps) => {
  const chartData = useMemo(() => {
    if (!history || history.length === 0) return []

    const sortedHistory = [...history].sort((a, b) => {
      const timeA = parseInt(a.timestampMs) || 0
      const timeB = parseInt(b.timestampMs) || 0
      return timeA - timeB
    })

    const now = new Date()
    const thirtyDaysAgo = subDays(now, 30)

    const firstActivityDate =
      sortedHistory.length > 0 ? new Date(parseInt(sortedHistory[0].timestampMs)) : thirtyDaysAgo

    const startDate = firstActivityDate > thirtyDaysAgo ? firstActivityDate : thirtyDaysAgo

    const days = eachDayOfInterval({
      start: startOfDay(startDate),
      end: startOfDay(now),
    })

    const pointsByDay: Record<string, number> = {}

    sortedHistory.forEach(activity => {
      const activityDate = new Date(parseInt(activity.timestampMs))
      const dayKey = format(activityDate, 'yyyy-MM-dd')
      pointsByDay[dayKey] = (pointsByDay[dayKey] || 0) + (activity.rewardAmount || 0)
    })

    let priorPoints = 0
    sortedHistory.forEach(activity => {
      const activityDate = new Date(parseInt(activity.timestampMs))
      if (activityDate < startOfDay(startDate)) {
        priorPoints += activity.rewardAmount || 0
      }
    })

    let cumulative = priorPoints
    const data: ChartDataPoint[] = days.map(day => {
      const dayKey = format(day, 'yyyy-MM-dd')
      const dailyPoints = pointsByDay[dayKey] || 0
      cumulative += dailyPoints

      return {
        date: dayKey,
        dateLabel: format(day, 'MMM d'),
        dailyPoints,
        cumulativePoints: cumulative,
      }
    })

    return data
  }, [history])

  if (chartData.length === 0) {
    return null
  }

  const totalGrowth =
    chartData.length > 1
      ? chartData[chartData.length - 1].cumulativePoints - chartData[0].cumulativePoints
      : 0

  return (
    <div
      className="flex min-w-0 flex-col rounded-[0.625rem] pb-1 text-white"
      style={{
        backgroundColor: '#1a1919',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center justify-between px-5 pt-5">
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Tokens Growth</h3>
          <p className="text-sm text-[var(--color-text-muted)]">Your SENTINEL tokens over time</p>
        </div>
        {totalGrowth > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-[var(--color-success-muted)] px-3 py-1.5">
            <TrendingUp className="h-4 w-4 text-[var(--color-success)]" />
            <span className="text-sm font-medium text-[var(--color-success)]">
              +{totalGrowth.toLocaleString()} tokens
            </span>
          </div>
        )}
      </div>

      <div className="h-[280px] w-full px-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="pointsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-gold-primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-gold-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border-subtle)' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border-subtle)' }}
              tickFormatter={value => value.toLocaleString()}
              width={60}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as ChartDataPoint
                  return (
                    <div className="rounded-lg border border-white/10 bg-[#1a1919] p-3 shadow-lg">
                      <p className="mb-1 text-sm font-medium text-[var(--color-text-primary)]">{label}</p>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        Total:{' '}
                        <span className="font-semibold text-[var(--color-gold-primary)]">
                          {data.cumulativePoints.toLocaleString()} SENTINEL
                        </span>
                      </p>
                      {data.dailyPoints > 0 && (
                        <p className="text-xs text-[var(--color-text-muted)]">
                          +{data.dailyPoints.toLocaleString()} earned this day
                        </p>
                      )}
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey="cumulativePoints"
              stroke="var(--color-gold-primary)"
              strokeWidth={2}
              fill="url(#pointsGradient)"
              dot={false}
              activeDot={{
                r: 6,
                fill: 'var(--color-gold-primary)',
                stroke: 'var(--color-bg-surface)',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
