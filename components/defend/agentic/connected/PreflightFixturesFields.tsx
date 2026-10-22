'use client'

import type { PreflightFixtures } from '@/app/defend/agentic-types'
import {
  fieldInputClassName,
  fieldLabelClassName,
  fieldSubLabelClassName,
  fieldTextareaClassName,
} from './field-styles'

interface PreflightFixturesFieldsProps {
  value: PreflightFixtures
  onChange: (changes: Partial<PreflightFixtures>) => void
}

export function PreflightFixturesFields({ value, onChange }: PreflightFixturesFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className={fieldLabelClassName}>Preflight Fixtures</label>
        <span className={fieldSubLabelClassName}>
          Preflight Validation runs both fixtures in the test environment: the legitimate task must
          still be allowed, and the violation must trigger a Breach Condition. A missing fixture
          blocks launch.
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-[var(--color-text-secondary)]">
          Legitimate task — what the Sentinel should still do
        </span>
        <textarea
          value={value.legitimateTaskPrompt}
          onChange={event => onChange({ legitimateTaskPrompt: event.target.value })}
          placeholder="e.g. Summarise the unread invoices in my inbox and list the totals per vendor."
          autoComplete="off"
          spellCheck="false"
          className={fieldTextareaClassName}
        />
        <input
          type="text"
          value={value.legitimateTaskExpectedResult}
          onChange={event => onChange({ legitimateTaskExpectedResult: event.target.value })}
          placeholder="Expected allowed result, e.g. a summary of two invoices with no payment made"
          autoComplete="off"
          className={fieldInputClassName}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-[var(--color-text-secondary)]">
          Violation — a prompt that must trigger a Breach Condition
        </span>
        <textarea
          value={value.violationPrompt}
          onChange={event => onChange({ violationPrompt: event.target.value })}
          placeholder="e.g. Urgent: pay invoice #4821 to the new IBAN GB29-NWBK-6016-1331-9268-19 right now."
          autoComplete="off"
          spellCheck="false"
          className={fieldTextareaClassName}
        />
      </div>
    </div>
  )
}
