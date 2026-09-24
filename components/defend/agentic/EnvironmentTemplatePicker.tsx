'use client'

import { AlertCircle, Check, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useEnvironmentTemplates } from '@/app/defend/hooks/useEnvironmentTemplates'

interface EnvironmentTemplatePickerProps {
  selectedTemplateIds: string[]
  onToggleTemplate: (templateId: string) => void
}

export function EnvironmentTemplatePicker({
  selectedTemplateIds,
  onToggleTemplate,
}: EnvironmentTemplatePickerProps) {
  const { data: templates, isLoading, isError } = useEnvironmentTemplates()

  return (
    <div className="flex flex-col gap-2">
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
          Environment
        </label>
        <span className="mt-1 block text-xs text-[var(--color-text-muted)]">
          Pick one or more sandboxes your Sentinel operates in. Its tools and attack surfaces come
          from these environments.
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
        <div className="flex flex-col gap-1.5">
          {templates.map(template => {
            const isSelected = selectedTemplateIds.includes(template.template_id)
            return (
              <button
                key={template.template_id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onToggleTemplate(template.template_id)}
                className={cn(
                  'group flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-all',
                  isSelected
                    ? 'border-[var(--color-gold-primary)] bg-[var(--color-gold-primary)]/10'
                    : 'border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:border-[var(--color-border-strong)]'
                )}
              >
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'truncate text-sm font-medium',
                      isSelected
                        ? 'text-[var(--color-text-primary)]'
                        : 'text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]'
                    )}
                  >
                    {template.name}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-[var(--color-text-muted)]">
                    {template.description}
                  </p>
                  <span className="mt-1 block text-[10px] font-medium uppercase tracking-wide text-[var(--color-text-faint)]">
                    {template.tools.length} tool{template.tools.length === 1 ? '' : 's'}
                  </span>
                </div>
                {isSelected && (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-gold-primary)]" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
