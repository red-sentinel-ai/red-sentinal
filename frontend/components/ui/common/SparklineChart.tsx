import * as React from 'react'

interface SparklineChartProps extends React.SVGProps<SVGSVGElement> {
  data: number[]
  width?: number
  height?: number
  strokeWidth?: number
  strokeColor?: string
  gradientId?: string
}

export const SparklineChart = ({
  data,
  width = 100,
  height = 30,
  strokeWidth = 2,
  strokeColor = '#3b82f6',
  gradientId = 'sparkline-gradient',
  ...props
}: SparklineChartProps) => {
  if (!data || data.length < 2) {
    return (
      <svg
        width={width}
        height={height}
        {...props}
      >
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray="2 4"
        />
      </svg>
    )
  }

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min === 0 ? 1 : max - min

  const path = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((d - min) / range) * height
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      {...props}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <stop
            offset="0%"
            stopColor="#558EB4"
            stopOpacity={0.5}
          />
          <stop
            offset="100%"
            stopColor="#1388D5"
          />
        </linearGradient>
      </defs>
      <path
        d={path}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
