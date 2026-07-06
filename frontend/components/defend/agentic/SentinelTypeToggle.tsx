'use client'

import { MessageSquare, Wrench } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { SentinelType } from '@/app/defend/agentic-types'

interface SentinelTypeOption {
  type: SentinelType
  label: string
  description: string
  icon: typeof MessageSquare
}

const SENTINEL_TYPE_OPTIONS: SentinelTypeOption[] = [
  {
    type: 'basic',
    label: 'Conversational',
    description: 'Defends secrets through dialogue alone.',
    icon: MessageSquare,
  },
  {
    type: 'agentic',
    label: 'Tool-using',
    description: 'Acts in a sandbox using tools attackers can exploit.',
    icon: Wrench,
  },
]

interface SentinelTypeToggleProps {
  value: SentinelType
  onChange: (type: SentinelType) => void
}

export function SentinelTypeToggle({ value, onChange }: SentinelTypeToggleProps) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
          Sentinel Type
        </label>
        <span className="mt-1 block text-xs text-[var(--color-text-muted)]">
          Choose how your Sentinel defends. Tool-using Sentinels run inside a sandbox where
          attackers try to make them take forbidden actions.
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SENTINEL_TYPE_OPTIONS.map(option => {
          const Icon = option.icon
          const isSelected = value === option.type
          return (
            <button
              key={option.type}
              type="button"
              onClick={() => onChange(option.type)}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-4 text-left transition-all',
                isSelected
                  ? 'border-[var(--color-gold-primary)] bg-[var(--color-gold-primary)]/10'
                  : 'border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:border-[var(--color-border-strong)]'
              )}
            >
              <Icon
                className={cn(
                  'mt-0.5 h-5 w-5 shrink-0',
                  isSelected
                    ? 'text-[var(--color-gold-primary)]'
                    : 'text-[var(--color-text-muted)]'
                )}
              />
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {option.label}
                </p>
                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                  {option.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
