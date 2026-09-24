'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Loader2 } from 'lucide-react'

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui'
import { usePracticeSentinel } from '@/hooks/practice/usePracticeSentinel'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { getPracticeAttackerAddress } from '@/lib/practice'
import { PracticeSentinelPanel } from './PracticeSentinelPanel'
import { PracticeSentinelInfoModal } from './PracticeSentinelInfoModal'
import { PracticeChatInterface } from './PracticeChatInterface'

const BRIEFING_SIDEBAR_MEDIA_QUERY = '(min-width: 1024px)'

const BRIEFING_SIDEBAR_SIZE = { default: 28, min: 22, max: 40 }

export function PracticeAttackView({ sentinelId }: { sentinelId: number }) {
  const { data: sentinel, isPending, isError } = usePracticeSentinel(sentinelId)
  const hasBriefingSidebar = useMediaQuery(BRIEFING_SIDEBAR_MEDIA_QUERY)

  const [attackerAddress, setAttackerAddress] = useState('')
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)

  // Per-browser practice identity lives in localStorage, read on the client
  // only to avoid an SSR hydration mismatch.
  useEffect(() => {
    setAttackerAddress(getPracticeAttackerAddress())
  }, [])

  if (isPending) {
    return (
      <div className="flex h-[calc(100dvh-var(--topbar-h))] items-center justify-center bg-[var(--color-bg-base)]">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-text-muted)]" />
      </div>
    )
  }

  if (isError || !sentinel) {
    return (
      <div className="flex h-[calc(100dvh-var(--topbar-h))] flex-col items-center justify-center gap-3 bg-[var(--color-bg-base)] p-4 text-center">
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

  if (hasBriefingSidebar) {
    return (
      <div className="flex h-[calc(100dvh-var(--topbar-h))] bg-[var(--color-bg-base)]">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            defaultSize={BRIEFING_SIDEBAR_SIZE.default}
            minSize={BRIEFING_SIDEBAR_SIZE.min}
            maxSize={BRIEFING_SIDEBAR_SIZE.max}
          >
            <PracticeSentinelPanel sentinel={sentinel} />
          </ResizablePanel>
          <ResizableHandle withHandle className="bg-[var(--color-border-strong)]" />
          <ResizablePanel>
            <PracticeChatInterface sentinel={sentinel} attackerAddress={attackerAddress} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100dvh-var(--topbar-h))] flex-col bg-[var(--color-bg-base)]">
      <PracticeChatInterface
        sentinel={sentinel}
        attackerAddress={attackerAddress}
        onOpenSentinelInfo={() => setIsInfoModalOpen(true)}
      />

      {/* Same briefing the sidebar shows, for widths where the sidebar is gone */}
      <PracticeSentinelInfoModal
        open={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        sentinel={sentinel}
      />
    </div>
  )
}
