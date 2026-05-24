'use client'

import { Info, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MobileAgentHeaderProps {
  agentName: string
  onInfoClick: () => void
}

export const MobileAgentHeader = ({ agentName, onInfoClick }: MobileAgentHeaderProps) => {
  const router = useRouter()

  return (
    <div className="flex h-12 flex-shrink-0 items-center justify-between border-b border-[var(--color-border-strong)] bg-black px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          onClick={() => router.push('/attack')}
          className="flex-shrink-0 touch-manipulation p-1 text-[var(--color-text-muted)] transition-colors hover:text-white active:text-white"
          aria-label="Go back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="industrial-header truncate text-[11px] tracking-widest text-white">
          {agentName.toUpperCase().replace(/\s+/g, '_')}
        </h1>
      </div>
      <button
        onClick={onInfoClick}
        className="flex-shrink-0 border border-[var(--color-border-strong)] p-2 text-[var(--color-text-muted)] transition-colors hover:border-white hover:text-white"
        aria-label="Show agent information"
      >
        <Info className="h-4 w-4" />
      </button>
    </div>
  )
}
