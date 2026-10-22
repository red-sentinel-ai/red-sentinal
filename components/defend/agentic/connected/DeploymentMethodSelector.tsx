'use client'

import { LayoutTemplate, Link2, Plug } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { DeploymentMethod } from '@/app/defend/agentic-types'
import { fieldLabelClassName, fieldSubLabelClassName } from './field-styles'

interface DeploymentMethodOption {
  method: DeploymentMethod
  label: string
  description: string
  icon: typeof Plug
}

const DEPLOYMENT_METHOD_OPTIONS: DeploymentMethodOption[] = [
  {
    method: 'template',
    label: 'Sandbox template',
    description: 'Runs in a Red Sentinel sandbox environment with its built-in tools.',
    icon: LayoutTemplate,
  },
  {
    method: 'hosted_agent',
    label: 'Hosted Agent + MCP',
    description:
      'Red Sentinel runs the agent; it uses tools from MCP servers you connect to your test environment.',
    icon: Plug,
  },
  {
    method: 'existing_agent',
    label: 'Existing Agent Connection',
    description:
      'Attack your own agent API. Its model and private instructions stay with you — nothing to rebuild.',
    icon: Link2,
  },
]

interface DeploymentMethodSelectorProps {
  value: DeploymentMethod
  onChange: (method: DeploymentMethod) => void
}

export function DeploymentMethodSelector({ value, onChange }: DeploymentMethodSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <label className={fieldLabelClassName}>Deployment Method</label>
        <span className={fieldSubLabelClassName}>
          Choose where your tool-using Sentinel runs. Connected methods need Breach Conditions and
          Preflight Validation before launch.
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {DEPLOYMENT_METHOD_OPTIONS.map(option => {
          const Icon = option.icon
          const isSelected = value === option.method
          return (
            <button
              key={option.method}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(option.method)}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-4 text-left transition-all',
                isSelected
                  ? 'bg-[var(--color-gold-primary)]/10 border-[var(--color-gold-primary)]'
                  : 'border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:border-[var(--color-border-strong)]'
              )}
            >
              <Icon
                className={cn(
                  'mt-0.5 h-5 w-5 shrink-0',
                  isSelected ? 'text-[var(--color-gold-primary)]' : 'text-[var(--color-text-muted)]'
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
