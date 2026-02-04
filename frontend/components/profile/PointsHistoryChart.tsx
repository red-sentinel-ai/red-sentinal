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

    // Get date range (last 30 days or from first activity, whichever is more recent)
    const now = new Date()
    const thirtyDaysAgo = subDays(now, 30)

    const firstActivityDate =
      sortedHistory.length > 0
        ? new Date(parseInt(sortedHistory[0].timestampMs))
        : thirtyDaysAgo

    const startDate =
      firstActivityDate > thirtyDaysAgo ? firstActivityDate : thirtyDaysAgo

    // Generate all days in range
    const days = eachDayOfInterval({
      start: startOfDay(startDate),
      end: startOfDay(now),
    })

    // Group points by day
    const pointsByDay: Record<string, number> = {}

    sortedHistory.forEach(activity => {
      const activityDate = new Date(parseInt(activity.timestampMs))
      const dayKey = format(activityDate, 'yyyy-MM-dd')
      pointsByDay[dayKey] = (pointsByDay[dayKey] || 0) + (activity.rewardAmount || 0)
    })

    // Calculate cumulative points for activities before the start date
    let priorPoints = 0
    sortedHistory.forEach(activity => {
      const activityDate = new Date(parseInt(activity.timestampMs))
      if (activityDate < startOfDay(startDate)) {
        priorPoints += activity.rewardAmount || 0
      }
    })

    // Build chart data with cumulative values
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
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-md">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-black">Points Growth</h3>
          <p className="text-sm text-gray-500">Your SENTINEL points over time</p>
        </div>
        {totalGrowth > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-1.5">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">
              +{totalGrowth.toLocaleString()} pts
            </span>
          </div>
        )}
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="pointsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F632F3" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F632F3" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={value => value.toLocaleString()}
              width={60}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as ChartDataPoint
                  return (
                    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                      <p className="mb-1 text-sm font-medium text-gray-900">{label}</p>
                      <p className="text-sm text-gray-600">
                        Total:{' '}
                        <span className="font-semibold text-[#F632F3]">
                          {data.cumulativePoints.toLocaleString()} SENTINEL
                        </span>
                      </p>
                      {data.dailyPoints > 0 && (
                        <p className="text-xs text-gray-500">
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
              stroke="#F632F3"
              strokeWidth={2}
              fill="url(#pointsGradient)"
              dot={false}
              activeDot={{
                r: 6,
                fill: '#F632F3',
                stroke: '#fff',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
