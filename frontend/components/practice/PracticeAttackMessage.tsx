'use client'

import type { PracticeAttackMessage as Message } from '@/types/practice'
import { PracticeAttackVerdict } from './PracticeAttackVerdict'

export function PracticeAttackMessage({ message }: { message: Message }) {
  if (message.role === 'user') {
    return (
      <div className="flex flex-col items-end gap-2">
        <span className="industrial-header text-[10px] text-[var(--color-text-muted)]">
          @YOU
        </span>
        <div className="max-w-[85%] border border-white/20 bg-white/5 p-4 lg:max-w-[75%]">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-white">
            {message.content}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <span className="industrial-header text-[10px] text-[var(--color-text-muted)]">
        {'// SENTINEL'}
      </span>
      <div className="max-w-[85%] border border-[var(--color-border-default)] bg-[var(--color-bg-subtle)] p-4 lg:max-w-[75%]">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-primary)]">
          {message.content}
        </p>
      </div>
      <PracticeAttackVerdict verdict={message.verdict} />
    </div>
  )
}
