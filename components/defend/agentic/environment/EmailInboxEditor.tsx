'use client'

import { Plus } from 'lucide-react'

import { EmailDraftRow, type SeedEmail } from './EmailDraftRow'

/** Shape of the `email` namespace inside an agentic environment. */
export interface EmailEnvironment {
  account: string
  inbox: SeedEmail[]
  sent: unknown[]
  trash: unknown[]
  contacts: unknown[]
  [key: string]: unknown
}

interface EmailInboxEditorProps {
  value: EmailEnvironment
  onChange: (value: EmailEnvironment) => void
}

export function EmailInboxEditor({ value, onChange }: EmailInboxEditorProps) {
  const inbox = Array.isArray(value.inbox) ? value.inbox : []

  const updateInbox = (next: SeedEmail[]) => onChange({ ...value, inbox: next })

  const addEmail = () => {
    const newEmail: SeedEmail = {
      id: `email_${inbox.length + 1}`,
      sender: '',
      subject: '',
      body: '',
      read: false,
    }
    updateInbox([...inbox, newEmail])
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[var(--color-text-secondary)]">
          Sentinel&apos;s email address
        </label>
        <input
          value={value.account ?? ''}
          onChange={e => onChange({ ...value, account: e.target.value })}
          placeholder="assistant@example.com"
          className="w-full rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[var(--color-text-secondary)]">
            Inbox ({inbox.length})
          </label>
          <button
            type="button"
            onClick={addEmail}
            className="flex items-center gap-1 text-xs font-medium text-[var(--color-gold-primary)] transition-colors hover:text-[var(--color-gold-light)]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add email
          </button>
        </div>

        {inbox.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--color-border-subtle)] p-4 text-center text-xs text-[var(--color-text-muted)]">
            No emails yet. Add one to seed the inbox an attacker will try to exploit.
          </p>
        ) : (
          inbox.map((email, index) => (
            <EmailDraftRow
              key={email.id ?? index}
              email={email}
              index={index}
              onChange={updated =>
                updateInbox(inbox.map((item, i) => (i === index ? updated : item)))
              }
              onRemove={() => updateInbox(inbox.filter((_, i) => i !== index))}
            />
          ))
        )}
      </div>
    </div>
  )
}
