'use client'

import { AlertTriangle } from 'lucide-react'

export function ExternalConnectionWarning() {
  return (
    <div
      role="alert"
      className="border-[var(--color-warning)]/40 bg-[var(--color-warning)]/10 flex items-start gap-3 rounded-lg border p-4"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-warning)]" />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">
          Attackers can cause real actions in the environment you connect.
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          Every successful jailbreak runs against your connected services. Use test credentials and
          non-production services only, and never connect anything that holds real data or money.
        </p>
      </div>
    </div>
  )
}
