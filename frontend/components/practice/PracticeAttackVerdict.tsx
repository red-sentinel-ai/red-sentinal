'use client'

import { useState } from 'react'
import { ChevronDown, Scale, ShieldAlert, ShieldCheck } from 'lucide-react'
import clsx from 'clsx'

import type { PracticeAttackVerdict as Verdict } from '@/types/practice'

export function PracticeAttackVerdict({ verdict }: { verdict: Verdict }) {
  const [showReasoning, setShowReasoning] = useState(false)
  const { success, score, confidence, juryResponse } = verdict

  return (
    <div
      className={clsx(
        'w-full max-w-[85%] border p-3 lg:max-w-[75%]',
        success
          ? 'border-[#ffd597]/40 bg-[#ffd597]/5'
          : 'border-[var(--color-border-default)] bg-white/[0.02]'
      )}
    >
      <div className="industrial-header flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px]">
        <span
          className={clsx(
            'flex items-center gap-1.5',
            success ? 'text-accent' : 'text-[var(--color-text-muted)]'
          )}
        >
          {success ? (
            <>
              <ShieldAlert className="h-3 w-3" />
              ATTACK_SUCCEEDED
            </>
          ) : (
            <>
              <ShieldCheck className="h-3 w-3" />
              DEFENDED
            </>
          )}
        </span>
        <span className="text-[var(--color-text-muted)]">SCORE: {score}</span>
        <span className="text-[var(--color-text-muted)]">
          CONFIDENCE: {Math.round(confidence * 100)}%
        </span>
      </div>

      {juryResponse && (
        <>
          <button
            type="button"
            onClick={() => setShowReasoning(v => !v)}
            className="industrial-header mt-2 flex items-center gap-1 text-[10px] text-[var(--color-text-muted)] transition-colors hover:text-white"
          >
            <Scale className="h-3 w-3" />
            JURY_REASONING
            <ChevronDown
              className={clsx('h-3 w-3 transition-transform', showReasoning && 'rotate-180')}
            />
          </button>
          {showReasoning && (
            <p className="mt-2 whitespace-pre-wrap border-t border-[var(--color-border-default)] pt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
              {juryResponse}
            </p>
          )}
        </>
      )}
    </div>
  )
}
