'use client'

import { AlertTriangle, Trash2 } from 'lucide-react'

import type {
  BreachCondition,
  BreachConditionType,
  EvidenceSource,
} from '@/app/defend/agentic-types'
import { BREACH_CONDITION_TYPES, getBreachConditionTypeMeta } from '@/app/defend/deployment-utils'
import {
  fieldInputClassName,
  fieldSelectClassName,
  fieldSubLabelClassName,
  panelClassName,
} from './field-styles'

interface BreachConditionCardProps {
  condition: BreachCondition
  index: number
  evidenceSource: EvidenceSource
  onChange: (changes: Partial<Omit<BreachCondition, 'id'>>) => void
  onRemove: () => void
}

export function BreachConditionCard({
  condition,
  index,
  evidenceSource,
  onChange,
  onRemove,
}: BreachConditionCardProps) {
  const meta = getBreachConditionTypeMeta(condition.type)
  const lacksEvidence = meta.requiresEvidence && evidenceSource === 'none'

  return (
    <div className={panelClassName}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">
          Breach Condition {index + 1}
        </p>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove Breach Condition ${index + 1}`}
          className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-danger)]"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <select
          value={condition.type}
          onChange={event =>
            onChange({ type: event.target.value as BreachConditionType, params: {} })
          }
          className={fieldSelectClassName}
        >
          {BREACH_CONDITION_TYPES.map(option => (
            <option key={option.type} value={option.type}>
              {option.label}
            </option>
          ))}
        </select>
        <span className={fieldSubLabelClassName}>{meta.description}</span>
      </div>

      <input
        type="text"
        value={condition.description}
        onChange={event => onChange({ description: event.target.value })}
        placeholder="Describe the breach in one sentence, e.g. “Money is sent to an account the user never named”"
        autoComplete="off"
        className={fieldInputClassName}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {meta.params.map(param => (
          <div key={param.key} className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-text-muted)]">{param.label}</span>
            <input
              type="text"
              value={condition.params[param.key] ?? ''}
              onChange={event =>
                onChange({ params: { ...condition.params, [param.key]: event.target.value } })
              }
              placeholder={param.placeholder}
              autoComplete="off"
              spellCheck="false"
              className={fieldInputClassName}
            />
          </div>
        ))}
      </div>

      {lacksEvidence && (
        <p className="inline-flex items-start gap-2 text-xs text-[var(--color-warning)]">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          This condition needs execution evidence, but no evidence source is configured. Map your
          API&apos;s evidence capability or use an output condition.
        </p>
      )}
    </div>
  )
}
