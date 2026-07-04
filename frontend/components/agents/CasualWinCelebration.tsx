'use client'

import { Swords, RotateCcw, PartyPopper } from 'lucide-react'

interface CasualWinCelebrationProps {
  onAttackForReal: () => void
  onReset: () => void
}

export function CasualWinCelebration({ onAttackForReal, onReset }: CasualWinCelebrationProps) {
  return (
    <div className="border-t border-[var(--color-border-strong)] bg-[var(--color-bg-base)] p-6">
      <div className="mx-auto max-w-4xl text-center">
        <div className="text-accent flex items-center justify-center gap-2">
          <PartyPopper className="h-4 w-4" />
          <h3 className="industrial-header text-sm">YOU_CRACKED_IT</h3>
        </div>
        <p className="mt-2 font-mono text-[11px] uppercase text-[var(--color-text-muted)]">
          In Attack mode this run would have won the bounty. Casual runs earn nothing,
          do it for real to claim the prize pool.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onAttackForReal}
            className="button-ghost-terminal flex items-center gap-2 px-4 py-1.5 text-[11px]"
          >
            <Swords className="h-3.5 w-3.5" />
            ATTACK_FOR_REAL
          </button>
          <button
            onClick={onReset}
            className="industrial-header flex items-center gap-1.5 border border-[var(--color-border-strong)] px-4 py-1.5 text-[10px] tracking-widest text-[var(--color-text-muted)] transition-colors hover:border-white hover:text-white"
          >
            <RotateCcw className="h-3 w-3" />
            RESET
          </button>
        </div>
      </div>
    </div>
  )
}
