'use client'

import { X, TrendingUp } from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { format } from 'date-fns'
import { Dialog } from '@/components/Dialog'
import { formatCompact } from '@/components/ui/common/TokenAmount'

export interface ChartDataPoint {
  time: Date
  value: number
}

interface PrizePoolChartModalProps {
  open: boolean
  onClose: () => void
  data: ChartDataPoint[]
  agentName: string
  tokenSymbol?: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: ChartDataPoint
    value: number
    name: string
  }>
  label?: string | number
  tokenSymbol?: string
}

const CustomTooltip = ({ active, payload, label, tokenSymbol = 'SUI' }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-gray-300 bg-white/80 p-3 shadow-lg backdrop-blur-md">
        <p className="text-xs text-gray-500">{format(new Date(label || 0), 'MMM d, yyyy p')}</p>
        <p className="text-base font-bold text-black">{`${formatCompact(payload[0].value, 4)} ${tokenSymbol}`}</p>
      </div>
    )
  }
  return null
}

export const PrizePoolChartModal = ({
  open,
  onClose,
  data,
  agentName,
  tokenSymbol = 'SUI',
}: PrizePoolChartModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} className="max-w-3xl border-gray-200 bg-white p-4 sm:p-6">
      <div className="mb-3 flex items-start justify-between sm:mb-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-black sm:text-xl">
            <TrendingUp className="size-5 text-[#1FAD57] sm:size-6" />
            Prize Pool History
          </h2>
          <p className="text-sm text-gray-600 sm:text-base">For Sentinel: {agentName}</p>
        </div>
        <button onClick={onClose} className="text-gray-500 transition-colors hover:text-black">
          <X className="size-5 sm:size-6" />
        </button>
      </div>

      <div className="h-[280px] w-full sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1FAD57" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#1FAD57" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="time"
              stroke="#6b7280"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={time => format(new Date(time), 'MMM d')}
              dy={10}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={value => `${value}`}
              width={40}
            />
            <Tooltip content={<CustomTooltip tokenSymbol={tokenSymbol} />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#1FAD57"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Dialog>
  )
}
