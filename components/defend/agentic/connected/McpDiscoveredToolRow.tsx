'use client'

import { AlertTriangle, Check } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { DiscoveredMcpTool } from '@/app/defend/agentic-types'

interface McpDiscoveredToolRowProps {
  tool: DiscoveredMcpTool
  isApproved: boolean
  /** The server's current definition differs from the approved snapshot. */
  isChanged: boolean
  onToggle: () => void
}

export function McpDiscoveredToolRow({
  tool,
  isApproved,
  isChanged,
  onToggle,
}: McpDiscoveredToolRowProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isApproved}
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3 text-left transition-all',
        isApproved
          ? 'border-[var(--color-gold-primary)]/50 bg-[var(--color-bg-surface)]'
          : 'border-[var(--color-border-default)] bg-[var(--color-bg-surface)] opacity-70 hover:opacity-100'
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
          isApproved
            ? 'border-[var(--color-gold-primary)] bg-[var(--color-gold-primary)] text-[var(--color-text-on-gold)]'
            : 'border-[var(--color-border-strong)]'
        )}
      >
        {isApproved && <Check className="h-3 w-3" />}
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-medium text-[var(--color-text-primary)]">
            {tool.name}
          </span>
          {isApproved && (
            <span className="border-[var(--color-gold-primary)]/50 rounded-full border px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-gold-primary)]">
              Approved
            </span>
          )}
          {isChanged && (
            <span className="border-[var(--color-warning)]/50 inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-warning)]">
              <AlertTriangle className="h-3 w-3" />
              Definition changed — re-approve
            </span>
          )}
        </div>
        {tool.description && (
          <span className="text-xs text-[var(--color-text-muted)]">{tool.description}</span>
        )}
        {tool.arguments.length > 0 ? (
          <ul className="mt-1 flex flex-col gap-0.5">
            {tool.arguments.map(argument => (
              <li key={argument.name} className="text-[11px] text-[var(--color-text-muted)]">
                <span className="font-mono text-[var(--color-text-secondary)]">
                  {argument.name}
                </span>
                <span className="font-mono text-[var(--color-text-faint)]">: {argument.type}</span>
                {argument.required && (
                  <span className="ml-1 text-[var(--color-danger)]">required</span>
                )}
                {argument.description && <span> — {argument.description}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-[11px] text-[var(--color-text-faint)]">No arguments</span>
        )}
      </div>
    </button>
  )
}
