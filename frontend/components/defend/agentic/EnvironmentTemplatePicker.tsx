'use client'

import { AlertCircle, Check, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useEnvironmentTemplates } from '@/app/defend/hooks/useEnvironmentTemplates'

interface EnvironmentTemplatePickerProps {
  selectedTemplateId: string | null
  onSelect: (templateId: string) => void
}

export function EnvironmentTemplatePicker({
  selectedTemplateId,
  onSelect,
}: EnvironmentTemplatePickerProps) {
  const { data: templates, isLoading, isError } = useEnvironmentTemplates()

  return (
    <div className="flex flex-col gap-2">
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
          Environment
        </label>
        <span className="mt-1 block text-xs text-[var(--color-text-muted)]">
          Pick the sandbox your Sentinel operates in. Its tools and attack surfaces come from this
          environment.
        </span>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4 text-sm text-[var(--color-text-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading environments…
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-2 rounded-lg border border-[var(--color-danger)]/40 bg-[var(--color-bg-surface)] p-4 text-sm text-[var(--color-danger)]">
          <AlertCircle className="h-4 w-4" />
          Couldn&apos;t load environments. Please try again.
        </div>
      )}

      {templates && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {templates.map(template => {
            const isSelected = selectedTemplateId === template.template_id
            return (
              <button
                key={template.template_id}
                type="button"
                onClick={() => onSelect(template.template_id)}
                className={cn(
                  'flex flex-col gap-2 rounded-lg border p-4 text-left transition-all',
                  isSelected
                    ? 'border-[var(--color-gold-primary)] bg-[var(--color-gold-primary)]/10'
                    : 'border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:border-[var(--color-border-strong)]'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {template.name}
                  </p>
                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-[var(--color-gold-primary)]" />
                  )}
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">{template.description}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {template.tools.map(toolId => (
                    <span
                      key={toolId}
                      className="rounded-full border border-[var(--color-border-subtle)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)]"
                    >
                      {toolId}
                    </span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
