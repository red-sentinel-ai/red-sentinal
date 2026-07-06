'use client'

import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { EnvironmentToolMeta } from '@/app/defend/agentic-types'

interface EnabledToolsChecklistProps {
  tools: EnvironmentToolMeta[]
  enabledToolIds: string[]
  onChange: (enabledToolIds: string[]) => void
}

interface ToolBadge {
  label: string
  className: string
}

function getToolBadges(tool: EnvironmentToolMeta): ToolBadge[] {
  const badges: ToolBadge[] = []
  if (tool.side_effecting) {
    badges.push({
      label: 'Writes',
      className: 'border-[var(--color-danger)]/40 text-[var(--color-danger)]',
    })
  } else if (tool.read_only) {
    badges.push({
      label: 'Read-only',
      className: 'border-[var(--color-border-subtle)] text-[var(--color-text-muted)]',
    })
  }
  if (tool.stub) {
    badges.push({
      label: 'Stub',
      className: 'border-[var(--color-border-subtle)] text-[var(--color-text-faint)]',
    })
  }
  return badges
}

export function EnabledToolsChecklist({
  tools,
  enabledToolIds,
  onChange,
}: EnabledToolsChecklistProps) {
  const toggle = (toolId: string) => {
    if (enabledToolIds.includes(toolId)) {
      onChange(enabledToolIds.filter(id => id !== toolId))
    } else {
      onChange([...enabledToolIds, toolId])
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
          Tools
        </label>
        <span className="mt-1 block text-xs text-[var(--color-text-muted)]">
          Choose which tools your Sentinel can use. Write tools are the ones attackers try to
          trick it into calling.
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {tools.map(tool => {
          const isEnabled = enabledToolIds.includes(tool.tool_id)
          return (
            <button
              key={tool.tool_id}
              type="button"
              onClick={() => toggle(tool.tool_id)}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-3 text-left transition-all',
                isEnabled
                  ? 'border-[var(--color-gold-primary)]/50 bg-[var(--color-bg-surface)]'
                  : 'border-[var(--color-border-default)] bg-[var(--color-bg-surface)] opacity-60 hover:opacity-100'
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                  isEnabled
                    ? 'border-[var(--color-gold-primary)] bg-[var(--color-gold-primary)] text-[var(--color-text-on-gold)]'
                    : 'border-[var(--color-border-strong)]'
                )}
              >
                {isEnabled && <Check className="h-3 w-3" />}
              </span>
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-medium text-[var(--color-text-primary)]">
                    {tool.tool_id}
                  </span>
                  {getToolBadges(tool).map(badge => (
                    <span
                      key={badge.label}
                      className={cn(
                        'rounded-full border px-1.5 py-0.5 text-[10px] font-medium',
                        badge.className
                      )}
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>
                {tool.description && (
                  <span className="text-xs text-[var(--color-text-muted)]">{tool.description}</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
