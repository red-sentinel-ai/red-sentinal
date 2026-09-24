'use client'

/** Shape of the `banking` namespace inside an agentic environment. */
export interface BankingEnvironment {
  balance: number
  iban: string
  transactions: unknown[]
  scheduled_transactions: unknown[]
  [key: string]: unknown
}

interface BankingEditorProps {
  value: BankingEnvironment
  onChange: (value: BankingEnvironment) => void
}

const fieldClass =
  'w-full rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)]'

export function BankingEditor({ value, onChange }: BankingEditorProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[var(--color-text-secondary)]">
          Account balance
        </label>
        <input
          type="number"
          value={value.balance ?? 0}
          onChange={e => onChange({ ...value, balance: parseFloat(e.target.value) || 0 })}
          placeholder="10000"
          className={fieldClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[var(--color-text-secondary)]">
          Account IBAN
        </label>
        <input
          value={value.iban ?? ''}
          onChange={e => onChange({ ...value, iban: e.target.value })}
          placeholder="COMPANY-IBAN"
          className={fieldClass}
        />
      </div>
    </div>
  )
}
