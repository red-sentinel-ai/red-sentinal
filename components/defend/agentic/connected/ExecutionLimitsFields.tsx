'use client'

import type { ExecutionLimits } from '@/app/defend/agentic-types'
import { DEFAULT_EXECUTION_LIMITS, EXECUTION_LIMIT_BOUNDS } from '@/app/defend/agentic-types'
import { fieldInputClassName, fieldLabelClassName, fieldSubLabelClassName } from './field-styles'

interface ExecutionLimitsFieldsProps {
  value: ExecutionLimits
  onChange: (changes: Partial<ExecutionLimits>) => void
}

export function ExecutionLimitsFields({ value, onChange }: ExecutionLimitsFieldsProps) {
  const parse = (raw: string) => (raw === '' ? NaN : Number(raw))

  return (
    <div className="flex flex-col gap-2">
      <div>
        <label className={fieldLabelClassName}>Execution Limits</label>
        <span className={fieldSubLabelClassName}>
          Bound each attacker turn. Defaults to {DEFAULT_EXECUTION_LIMITS.max_tool_steps}{' '}
          tool-calling steps and a {DEFAULT_EXECUTION_LIMITS.turn_time_budget_seconds}-second turn
          budget; when the deadline is reached no further actions are dispatched.
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[var(--color-text-muted)]">
            Max tool-calling steps ({EXECUTION_LIMIT_BOUNDS.max_tool_steps.min}–
            {EXECUTION_LIMIT_BOUNDS.max_tool_steps.max})
          </span>
          <input
            type="number"
            min={EXECUTION_LIMIT_BOUNDS.max_tool_steps.min}
            max={EXECUTION_LIMIT_BOUNDS.max_tool_steps.max}
            step={1}
            value={Number.isFinite(value.max_tool_steps) ? value.max_tool_steps : ''}
            onChange={event => onChange({ max_tool_steps: parse(event.target.value) })}
            className={fieldInputClassName}
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[var(--color-text-muted)]">
            Turn time budget in seconds ({EXECUTION_LIMIT_BOUNDS.turn_time_budget_seconds.min}–
            {EXECUTION_LIMIT_BOUNDS.turn_time_budget_seconds.max})
          </span>
          <input
            type="number"
            min={EXECUTION_LIMIT_BOUNDS.turn_time_budget_seconds.min}
            max={EXECUTION_LIMIT_BOUNDS.turn_time_budget_seconds.max}
            step={1}
            value={
              Number.isFinite(value.turn_time_budget_seconds) ? value.turn_time_budget_seconds : ''
            }
            onChange={event => onChange({ turn_time_budget_seconds: parse(event.target.value) })}
            className={fieldInputClassName}
          />
        </div>
      </div>
    </div>
  )
}
