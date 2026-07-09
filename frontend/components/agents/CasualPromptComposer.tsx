'use client'

import { useRef, useEffect } from 'react'
import { Loader2, Zap } from 'lucide-react'

interface CasualPromptComposerProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isSubmitting: boolean
  error: string | null
}

export function CasualPromptComposer({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  error,
}: CasualPromptComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    const maxHeight = Math.min(window.innerHeight * 0.4, 300)
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
  }, [value])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || value.trim().length === 0) return
    onSubmit()
  }

  return (
    <div className="border-t border-[var(--color-border-strong)] bg-[var(--color-bg-base)] px-4 py-3 lg:px-6 lg:py-4">
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-2">
        <div className="border border-[var(--color-border-strong)] bg-[var(--color-bg-base)] transition-all focus-within:border-white">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="terminal-scrollbar placeholder:text-[var(--color-text-muted)]/30 min-h-[56px] w-full resize-none border-0 bg-[var(--color-bg-base)] px-4 py-3 font-mono text-sm text-white focus:outline-none focus:ring-0"
            disabled={isSubmitting}
            placeholder="Type a message — no wallet needed..."
            rows={1}
            style={{ overflow: 'hidden' }}
            autoComplete="off"
            spellCheck="false"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <div className="flex items-center justify-between border-t border-[var(--color-border-default)] px-3 py-2">
            <span className="industrial-header text-[var(--color-text-muted)]/50 text-[9px] tracking-widest">
              FEE: <span className="text-[var(--color-text-muted)]">FREE</span>
            </span>
            <button
              type="submit"
              disabled={isSubmitting || value.length === 0}
              className="button-ghost-terminal flex items-center gap-2 px-4 py-1.5 text-[11px] disabled:cursor-not-allowed disabled:opacity-30"
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <span>EXECUTE</span>
                  <Zap className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="border-[var(--color-danger)]/30 border bg-[var(--color-danger-muted)] px-3 py-2">
            <span className="font-mono text-[11px] uppercase text-[var(--color-danger)]">
              {error}
            </span>
          </div>
        )}
      </form>
    </div>
  )
}
