import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { SupportedToken } from '@/constants'

interface TokenAmountProps {
  /** Raw on-chain amount in base units (e.g. MIST for SUI) */
  rawAmount: string | number
  token: SupportedToken
  precision?: number
  className?: string
  iconSize?: number
}

export function formatCompact(value: number, precision = 2): string {
  if (value >= 1_000_000_000) return `${parseFloat((value / 1_000_000_000).toFixed(2))}B`
  if (value >= 1_000_000) return `${parseFloat((value / 1_000_000).toFixed(2))}M`
  if (value >= 1_000) return `${parseFloat((value / 1_000).toFixed(2))}K`
  const formatted = value.toFixed(precision)
  // Prevent a non-zero value from displaying as "0.00" due to rounding (e.g. 0.001 with precision=2)
  if (value !== 0 && parseFloat(formatted) === 0) {
    return parseFloat(value.toPrecision(2)).toString()
  }
  return formatted
}

export function TokenAmount({
  rawAmount,
  token,
  precision = 4,
  className,
  iconSize = 14,
}: TokenAmountProps) {
  const value = Number(rawAmount) / Math.pow(10, token.decimals)
  const displayAmount = formatCompact(value, precision)

  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <Image
        src={token.icon}
        width={iconSize}
        height={iconSize}
        alt={token.symbol}
        className="shrink-0"
      />
      <span>{displayAmount}</span>
      <span>{token.symbol}</span>
    </span>
  )
}
