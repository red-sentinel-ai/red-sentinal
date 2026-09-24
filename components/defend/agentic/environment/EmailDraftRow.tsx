'use client'

import { Trash2 } from 'lucide-react'

export interface SeedEmail {
  id: string
  sender: string
  subject: string
  body: string
  read?: boolean
  [key: string]: unknown
}

interface EmailDraftRowProps {
  email: SeedEmail
  index: number
  onChange: (email: SeedEmail) => void
  onRemove: () => void
}

const fieldClass =
  'w-full rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-2.5 py-1.5 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)]'

export function EmailDraftRow({ email, index, onChange, onRemove }: EmailDraftRowProps) {
  const update = (patch: Partial<SeedEmail>) => onChange({ ...email, ...patch })

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--color-text-muted)]">
          Email {index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-danger)]"
          aria-label="Remove email"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          value={email.sender}
          onChange={e => update({ sender: e.target.value })}
          placeholder="Sender (e.g. vendor@example.com)"
          className={fieldClass}
        />
        <input
          value={email.subject}
          onChange={e => update({ subject: e.target.value })}
          placeholder="Subject"
          className={fieldClass}
        />
      </div>
      <textarea
        value={email.body}
        onChange={e => update({ body: e.target.value })}
        placeholder="Body — this is where injected instructions typically hide"
        className={`${fieldClass} min-h-[70px] resize-y`}
      />
    </div>
  )
}
