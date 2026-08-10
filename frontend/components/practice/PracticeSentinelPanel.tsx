'use client'

import type { PracticeSentinelPublic } from '@/types/practice'
import { PracticeSentinelBriefing } from './PracticeSentinelBriefing'

export function PracticeSentinelPanel({ sentinel }: { sentinel: PracticeSentinelPublic }) {
  return (
    <div className="terminal-scrollbar h-full overflow-y-auto bg-[var(--color-bg-base)] p-6">
      <PracticeSentinelBriefing sentinel={sentinel} />
    </div>
  )
}
