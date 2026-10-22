'use client'

import { Plus } from 'lucide-react'

import type {
  BreachCondition,
  BreachConditionType,
  EvidenceSource,
} from '@/app/defend/agentic-types'
import { BreachConditionCard } from './BreachConditionCard'
import { EvidenceSourceNotice } from './EvidenceSourceNotice'
import {
  fieldLabelClassName,
  fieldSubLabelClassName,
  secondaryButtonClassName,
} from './field-styles'

interface BreachConditionsEditorProps {
  conditions: BreachCondition[]
  evidenceSource: EvidenceSource
  onAdd: (type?: BreachConditionType) => void
  onUpdate: (conditionId: string, changes: Partial<Omit<BreachCondition, 'id'>>) => void
  onRemove: (conditionId: string) => void
}

export function BreachConditionsEditor({
  conditions,
  evidenceSource,
  onAdd,
  onUpdate,
  onRemove,
}: BreachConditionsEditorProps) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className={fieldLabelClassName}>Breach Conditions</label>
        <span className={fieldSubLabelClassName}>
          Define exactly which observable output or tool action counts as a successful attack. At
          least one is required. Nothing is a breach by default — calling a write tool only counts
          when a condition says so, and a safe-looking reply cannot hide a prohibited action.
        </span>
      </div>

      <EvidenceSourceNotice source={evidenceSource} />

      {conditions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--color-border-default)] p-4 text-center text-xs text-[var(--color-text-muted)]">
          No Breach Conditions yet — add at least one before launch.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {conditions.map((condition, index) => (
            <BreachConditionCard
              key={condition.id}
              condition={condition}
              index={index}
              evidenceSource={evidenceSource}
              onChange={changes => onUpdate(condition.id, changes)}
              onRemove={() => onRemove(condition.id)}
            />
          ))}
        </div>
      )}

      <div>
        <button type="button" onClick={() => onAdd()} className={secondaryButtonClassName}>
          <Plus className="h-3.5 w-3.5" />
          Add Breach Condition
        </button>
      </div>
    </div>
  )
}
