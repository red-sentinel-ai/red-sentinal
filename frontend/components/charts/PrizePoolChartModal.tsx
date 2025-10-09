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

export interface ChartDataPoint {
  time: Date
  value: number
}

interface PrizePoolChartModalProps {
  open: boolean
  onClose: () => void
  data: ChartDataPoint[]
  agentName: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: ChartDataPoint
    value: number
    name: string
  }>
  label?: string | number
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 backdrop-blur-md border border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="text-xs text-gray-400">{format(new Date(label || 0), 'MMM d, yyyy p')}</p>
        <p className="text-base font-bold text-white">{`${payload[0].value.toFixed(2)} SUI`}</p>
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
}: PrizePoolChartModalProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="max-w-3xl bg-[#101112] border-gray-800 p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-blue-400" />
            Prize Pool History
          </h2>
          <p className="text-gray-400">For Sentinel: {agentName}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div
        className="w-full h-[400px]"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient
                id="colorValue"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#1388D5"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="#1388D5"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.1)"
            />
            <XAxis
              dataKey="time"
              stroke="rgba(255, 255, 255, 0.4)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(time) => format(new Date(time), 'MMM d, HH:mm')}
              dy={10}
            />
            <YAxis
              stroke="rgba(255, 255, 255, 0.4)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value} SUI`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#558EB4"
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
