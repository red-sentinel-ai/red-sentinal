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
    <div className="chat-composer">
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-2">
        <div className="border border-[var(--color-border-strong)] bg-[var(--color-bg-base)] transition-all focus-within:border-white">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="chat-composer-input terminal-scrollbar"
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
          <div className="chat-composer-footer justify-between">
            <span className="industrial-header text-[var(--color-text-muted)]/50 text-[9px] tracking-widest">
              FEE: <span className="text-[var(--color-text-muted)]">FREE</span>
            </span>
            <button
              type="submit"
              disabled={isSubmitting || value.length === 0}
              className="chat-submit-button button-ghost-terminal"
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

        {error && <p className="chat-error-banner">{error}</p>}
      </form>
    </div>
  )
}
