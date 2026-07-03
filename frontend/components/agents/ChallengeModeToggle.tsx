'use client'

import { Swords, Gamepad2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ChallengeMode = 'attack' | 'casual'

interface ChallengeModeToggleProps {
  mode: ChallengeMode
  onChange: (mode: ChallengeMode) => void
}

const MODES: { value: ChallengeMode; label: string; icon: typeof Swords }[] = [
  { value: 'attack', label: 'ATTACK', icon: Swords },
  { value: 'casual', label: 'CASUAL', icon: Gamepad2 },
]

export function ChallengeModeToggle({ mode, onChange }: ChallengeModeToggleProps) {
  return (
    <div className="inline-flex border border-[var(--color-border-strong)]">
      {MODES.map(({ value, label, icon: Icon }) => {
        const isActive = mode === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            aria-pressed={isActive}
            className={cn(
              'industrial-header flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-widest transition-colors',
              isActive
                ? 'bg-white text-black'
                : 'text-[var(--color-text-muted)] hover:text-white'
            )}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        )
      })}
    </div>
  )
}
