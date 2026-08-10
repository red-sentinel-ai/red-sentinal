'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Loader2 } from 'lucide-react'

import { usePracticeSentinel } from '@/hooks/practice/usePracticeSentinel'
import { getPracticeAttackerAddress } from '@/lib/practice'
import { PracticeSentinelPanel } from './PracticeSentinelPanel'
import { PracticeSentinelInfoModal } from './PracticeSentinelInfoModal'
import { PracticeChatInterface } from './PracticeChatInterface'

export function PracticeAttackView({ sentinelId }: { sentinelId: number }) {
  const { data: sentinel, isPending, isError } = usePracticeSentinel(sentinelId)

  const [attackerAddress, setAttackerAddress] = useState('')
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)

  // Per-browser practice identity lives in localStorage, read on the client
  // only to avoid an SSR hydration mismatch.
  useEffect(() => {
    setAttackerAddress(getPracticeAttackerAddress())
  }, [])

  if (isPending) {
    return (
      <div className="flex h-[calc(100dvh-64px)] items-center justify-center bg-[var(--color-bg-base)]">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-text-muted)]" />
      </div>
    )
  }

  if (isError || !sentinel) {
    return (
      <div className="flex h-[calc(100dvh-64px)] flex-col items-center justify-center gap-3 bg-[var(--color-bg-base)] p-4 text-center">
        <AlertTriangle className="h-8 w-8 text-[var(--color-text-muted)]" />
        <p className="industrial-header text-sm text-[var(--color-text-muted)]">
          SENTINEL_NOT_FOUND
        </p>
        <Link
          href="/practice"
          className="industrial-header text-[10px] text-[var(--color-text-muted)] underline hover:text-white"
        >
          BACK_TO_PRACTICE
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100dvh-64px)] flex-col bg-[var(--color-bg-base)] lg:flex-row">
      {/* Briefing — desktop sidebar */}
      <aside className="hidden lg:block lg:h-full lg:w-[360px] lg:shrink-0">
        <PracticeSentinelPanel sentinel={sentinel} />
      </aside>

      <div className="flex min-h-0 flex-1 flex-col">
        <PracticeChatInterface
          sentinel={sentinel}
          attackerAddress={attackerAddress}
          onOpenSentinelInfo={() => setIsInfoModalOpen(true)}
        />
      </div>

      {/* Same briefing as the sidebar, for screens where the sidebar is hidden */}
      <PracticeSentinelInfoModal
        open={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        sentinel={sentinel}
      />
    </div>
  )
}
