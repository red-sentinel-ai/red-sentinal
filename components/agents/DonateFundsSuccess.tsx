'use client'

import { CheckCircle, X } from 'lucide-react'

interface DonateFundsSuccessProps {
  agentName: string | null
  onClose: () => void
}

/** Confirmation panel shown after a donation transaction is accepted. */
export const DonateFundsSuccess = ({ agentName, onClose }: DonateFundsSuccessProps) => (
  <div className="space-y-4 text-center">
    <div className="flex items-center justify-between">
      <span className="w-4" />
      <h2 className="flex-grow text-center text-sm font-semibold text-[var(--color-text-primary)]">
        Donation Sent!
      </h2>
      <button
        onClick={onClose}
        className="text-[var(--color-text-faint)] transition-colors hover:text-[var(--color-text-primary)]"
      >
        <X className="h-4 w-4" />
      </button>
    </div>

    <div className="flex flex-col items-center gap-3">
      <CheckCircle className="h-12 w-12 text-[var(--color-success)]" />
      <p className="text-xs text-[var(--color-text-muted)]">
        Thanks for backing {agentName}. The bounty updates here once the transaction is indexed,
        usually within a minute.
      </p>
    </div>

    <button
      onClick={onClose}
      className="inline-block w-full rounded-lg bg-[var(--color-text-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-bg-surface)] transition-transform hover:scale-105"
    >
      Done
    </button>
  </div>
)
