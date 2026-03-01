'use client'

import { useState, useEffect } from 'react'
import { SUI_SENTINEL_API_URL, APP_NETWORK, MIST_PER_SUI } from '@/constants'

interface StatItemData {
  id: string
  label: string
  value: number
  prefix: string
  suffix: string
  format: 'compact' | 'integer'
  accent: 'mint' | 'pink' | 'pulse' | 'blue'
}

interface LargestBountyWon {
  agentId: string
  winner: string
  amount: string
  timestamp: string
}

interface StatsApiResponse {
  network: string
  computedAt: string
  totalAttacks: number
  totalSentinelsLaunched: number
  activeSentinels: number
  defeatedSentinels: number
  totalBountyWon: string
  totalSentinelTokensDistributed: number
  tvl: string
  largestBountyWon: LargestBountyWon | null
}

// Convert MIST to SUI and round up to nearest integer
function mistToSui(mist: string): number {
  const sui = Number(mist) / MIST_PER_SUI
  return Math.ceil(sui)
}

// Fetch stats from API
async function fetchStats(network: string): Promise<StatsApiResponse> {
  const response = await fetch(`${SUI_SENTINEL_API_URL}/stats/${network}`)
  if (!response.ok) {
    throw new Error('Failed to fetch stats')
  }
  return response.json()
}

// Transform API response to stats array
function transformStats(data: StatsApiResponse): StatItemData[] {
  return [
    {
      id: 'tvl',
      label: 'Value Secured',
      value: mistToSui(data.tvl),
      prefix: '',
      suffix: ' SUI',
      format: 'compact',
      accent: 'mint',
    },
    {
      id: 'bounties',
      label: 'Bounties Claimed',
      value: mistToSui(data.totalBountyWon),
      prefix: '',
      suffix: ' SUI',
      format: 'compact',
      accent: 'pink',
    },
    {
      id: 'breached',
      label: 'Sentinels Breached',
      value: data.defeatedSentinels,
      prefix: '',
      suffix: '',
      format: 'integer',
      accent: 'pulse',
    },
    {
      id: 'active',
      label: 'Active Sentinels',
      value: data.activeSentinels,
      prefix: '',
      suffix: '',
      format: 'integer',
      accent: 'blue',
    },
    {
      id: 'token',
      label: '$SENTINEL Distributed',
      value: data.totalSentinelTokensDistributed,
      prefix: '',
      suffix: '',
      format: 'compact',
      accent: 'pulse',
    },
    {
      id: 'attacks',
      label: 'Attacks Launched',
      value: data.totalAttacks,
      prefix: '',
      suffix: '',
      format: 'compact',
      accent: 'pink',
    },
    {
      id: 'largest',
      label: 'Largest Breach',
      value: data.largestBountyWon ? mistToSui(data.largestBountyWon.amount) : 0,
      prefix: '',
      suffix: ' SUI',
      format: 'compact',
      accent: 'mint',
    },
  ]
}

// Default stats for loading/error states
const DEFAULT_STATS: StatItemData[] = [
  { id: 'tvl', label: 'Value Secured', value: 0, prefix: '', suffix: ' SUI', format: 'compact', accent: 'mint' },
  {
    id: 'bounties',
    label: 'Bounties Claimed',
    value: 0,
    prefix: '',
    suffix: ' SUI',
    format: 'compact',
    accent: 'pink',
  },
  {
    id: 'breached',
    label: 'Sentinels Breached',
    value: 0,
    prefix: '',
    suffix: '',
    format: 'integer',
    accent: 'pulse',
  },
  {
    id: 'active',
    label: 'Active Sentinels',
    value: 0,
    prefix: '',
    suffix: '',
    format: 'integer',
    accent: 'blue',
  },
  {
    id: 'token',
    label: '$SENTINEL Distributed',
    value: 0,
    prefix: '',
    suffix: '',
    format: 'compact',
    accent: 'pulse',
  },
  {
    id: 'attacks',
    label: 'Attacks Launched',
    value: 0,
    prefix: '',
    suffix: '',
    format: 'compact',
    accent: 'pink',
  },
  {
    id: 'largest',
    label: 'Largest Breach',
    value: 0,
    prefix: '',
    suffix: ' SUI',
    format: 'compact',
    accent: 'mint',
  },
]

function formatValue(value: number, format: 'compact' | 'integer', prefix: string, suffix: string): string {
  let display = ''
  if (format === 'compact') {
    if (value >= 1_000_000) display = (value / 1_000_000).toFixed(1) + 'M'
    else if (value >= 1_000) display = (value / 1_000).toFixed(1) + 'K'
    else display = value.toLocaleString()
  } else {
    display = value.toLocaleString()
  }
  return `${prefix}${display}${suffix}`
}

function useCountUp(target: number, duration = 1800): number {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start: number | null = null
    const raf = (timestamp: number) => {
      if (!start) start = timestamp
      const p = Math.min((timestamp - start) / duration, 1)
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }, [target, duration])
  return count
}

function StatItem({
  stat,
  index,
  total,
  isLoading,
}: {
  stat: StatItemData
  index: number
  total: number
  isLoading: boolean
}) {
  const animated = useCountUp(isLoading ? 0 : stat.value, 1500 + index * 100)
  const display = isLoading ? '—' : formatValue(animated, stat.format, stat.prefix, stat.suffix)

  return (
    <div
      className={`ssb-item ssb-accent-${stat.accent}`}
      style={{
        animationDelay: `${index * 70}ms`,
        borderRight: index < total - 1 ? '1px solid rgba(234,234,234,0.07)' : 'none',
      }}
    >
      <span className="ssb-value">{display}</span>
      <span className="ssb-label">{stat.label}</span>
      <span className="ssb-underline" />
    </div>
  )
}

export default function SentinelStatsBar() {
  const [stats, setStats] = useState<StatItemData[]>(DEFAULT_STATS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadStats = async () => {
      try {
        setIsLoading(true)
        const data = await fetchStats(APP_NETWORK)
        if (mounted) {
          setStats(transformStats(data))
        }
      } catch (error) {
        console.error('Failed to load stats:', error)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadStats()

    // Refresh every 60 seconds
    const interval = setInterval(loadStats, 60000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="ssb-shell">
      <div className="ssb-inner">
        {stats.map((stat, i) => (
          <StatItem
            key={stat.id}
            stat={stat}
            index={i}
            total={stats.length}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  )
}
