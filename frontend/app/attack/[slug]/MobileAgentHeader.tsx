'use client'

import { Info, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MobileAgentHeaderProps {
  agentName: string
  onInfoClick: () => void
}

export const MobileAgentHeader = ({ agentName, onInfoClick }: MobileAgentHeaderProps) => {
  const router = useRouter()

  return (
    <div className="flex flex-shrink-0 items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 py-2">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          onClick={() => router.push('/attack')}
          className="flex-shrink-0 touch-manipulation rounded-full p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-subtle)] active:bg-[var(--color-border-subtle)]"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="truncate text-sm font-semibold text-[var(--color-text-primary)]">{agentName}</h1>
      </div>
      <button
        onClick={onInfoClick}
        className="flex-shrink-0 rounded-full bg-[var(--color-bg-subtle)] p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-border-subtle)]"
        aria-label="Show agent information"
      >
        <Info className="h-5 w-5" />
      </button>
    </div>
  )
}
