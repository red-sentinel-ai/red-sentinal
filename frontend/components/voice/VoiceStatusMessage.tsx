'use client'

import type { ReactNode } from 'react'

interface VoiceStatusMessageProps {
  icon: ReactNode
  children: ReactNode
}

export function VoiceStatusMessage({ icon, children }: VoiceStatusMessageProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--color-border-strong)]">
        {icon}
      </div>
      {children}
    </div>
  )
}
