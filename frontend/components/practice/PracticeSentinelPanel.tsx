'use client'

import type { PracticeSentinelPublic } from '@/types/practice'
import { PracticeSentinelBriefing } from './PracticeSentinelBriefing'

export function PracticeSentinelPanel({ sentinel }: { sentinel: PracticeSentinelPublic }) {
  return (
    <div className="h-full overflow-y-auto border-r border-[var(--color-border-default)] bg-[var(--color-bg-base)] p-6">
      <PracticeSentinelBriefing sentinel={sentinel} />
    </div>
  )
}
