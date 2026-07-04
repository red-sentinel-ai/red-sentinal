'use client'

import { AlertTriangle } from 'lucide-react'

interface VoiceErrorNoticeProps {
  message: string
}

export function VoiceErrorNotice({ message }: VoiceErrorNoticeProps) {
  return (
    <div className="flex items-start gap-2.5 border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-3 py-2.5">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-danger)]" />
      <p className="font-mono text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        {message}
      </p>
    </div>
  )
}
