'use client'

import { Info, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MobileAgentHeaderProps {
  onInfoClick: () => void
}

export const MobileAgentHeader = ({ onInfoClick }: MobileAgentHeaderProps) => {
  const router = useRouter()

  return (
    <div className="flex h-10 flex-shrink-0 items-center justify-between border-b border-[var(--color-border-strong)] bg-black px-4">
      <button
        onClick={() => router.push('/attack')}
        className="-ml-1 flex touch-manipulation items-center gap-1 p-1 text-[var(--color-text-muted)] transition-colors hover:text-white active:text-white"
        aria-label="Go back"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="industrial-header text-[10px] tracking-widest">BACK</span>
      </button>
      <button
        onClick={onInfoClick}
        className="flex-shrink-0 border border-[var(--color-border-strong)] p-1.5 text-[var(--color-text-muted)] transition-colors hover:border-white hover:text-white"
        aria-label="Show agent information"
      >
        <Info className="h-4 w-4" />
      </button>
    </div>
  )
}
