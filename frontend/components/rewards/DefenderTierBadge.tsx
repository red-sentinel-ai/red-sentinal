import { cn } from '@/lib/utils'
import { DEFENDER_TIER_CONFIG, type DefenderTier } from './tierConfig'

export function DefenderTierBadge({ tier }: { tier: DefenderTier }) {
  const style = DEFENDER_TIER_CONFIG[tier]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        style.bg,
        style.text,
        style.border
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
      {style.label}
    </span>
  )
}
