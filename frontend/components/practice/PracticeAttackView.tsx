'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, Info, Loader2, RotateCcw, Send, Swords } from 'lucide-react'
import { toast } from 'sonner'

import { usePracticeSentinel } from '@/hooks/practice/usePracticeSentinel'
import { useAttackPracticeSentinel } from '@/hooks/practice/useAttackPracticeSentinel'
import { getPracticeAttackerAddress } from '@/lib/practice'
import type { PracticeAttackMessage as Message } from '@/types/practice'
import { PracticeSentinelPanel } from './PracticeSentinelPanel'
import { PracticeAttackMessage } from './PracticeAttackMessage'

export function PracticeAttackView({ sentinelId }: { sentinelId: number }) {
  const { data: sentinel, isPending, isError } = usePracticeSentinel(sentinelId)
  const attackMutation = useAttackPracticeSentinel()

  const [attackerAddress, setAttackerAddress] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [showBriefing, setShowBriefing] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const isAttacking = attackMutation.isPending

  // Per-browser practice identity lives in localStorage, read on the client
  // only to avoid an SSR hydration mismatch.
  useEffect(() => {
    setAttackerAddress(getPracticeAttackerAddress())
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isAttacking])

  const handleReset = () => {
    setAttackerAddress(getPracticeAttackerAddress(true))
    setMessages([])
    setSessionId(null)
    setInput('')
    toast.success('Started a fresh session')
  }

  const handleSend = async () => {
    const prompt = input.trim()
    if (!prompt || isAttacking || !attackerAddress) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: prompt }])

    try {
      const data = await attackMutation.mutateAsync({
        sentinelId,
        attackerAddress,
        userPrompt: prompt,
        sessionId,
      })
      setSessionId(data.session_id)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.agent_response,
          verdict: {
            success: data.success,
            score: data.score,
            confidence: data.confidence,
            juryResponse: data.jury_response,
          },
        },
      ])
      if (data.success) {
        toast.success('Sentinel breached — attack succeeded!')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Attack failed')
      // Roll back the optimistic user message so they can retry cleanly.
      setMessages(prev => prev.slice(0, -1))
      setInput(prompt)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (isPending) {
    return (
      <div className="flex h-[calc(100dvh-64px)] items-center justify-center bg-[var(--color-bg-base)]">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-text-muted)]" />
      </div>
    )
  }

  if (isError || !sentinel) {
    return (
      <div className="flex h-[calc(100dvh-64px)] flex-col items-center justify-center gap-3 bg-[var(--color-bg-base)] p-4 text-center">
        <AlertTriangle className="h-8 w-8 text-[var(--color-text-muted)]" />
        <p className="industrial-header text-sm text-[var(--color-text-muted)]">
          SENTINEL_NOT_FOUND
        </p>
        <Link
          href="/practice"
          className="industrial-header text-[10px] text-[var(--color-text-muted)] underline hover:text-white"
        >
          BACK_TO_PRACTICE
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100dvh-64px)] flex-col bg-[var(--color-bg-base)] lg:flex-row">
      <aside className="hidden lg:block lg:h-full lg:w-[360px] lg:shrink-0">
        <PracticeSentinelPanel sentinel={sentinel} />
      </aside>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--color-border-default)] px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/practice"
              className="text-[var(--color-text-muted)] transition-colors hover:text-white"
              aria-label="Back to practice"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="industrial-header truncate text-[11px] text-white">
              {(sentinel.name || `SENTINEL_${sentinel.sentinel_id}`)
                .toUpperCase()
                .replace(/\s+/g, '_')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowBriefing(v => !v)}
              className="industrial-header flex items-center gap-1.5 border border-[var(--color-border-default)] px-2.5 py-1.5 text-[10px] text-[var(--color-text-muted)] transition-colors hover:border-white hover:text-white lg:hidden"
            >
              <Info className="h-3 w-3" />
              BRIEFING
            </button>
            <button
              onClick={handleReset}
              disabled={isAttacking || messages.length === 0}
              className="industrial-header flex items-center gap-1.5 border border-[var(--color-border-default)] px-2.5 py-1.5 text-[10px] text-[var(--color-text-muted)] transition-colors hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw className="h-3 w-3" />
              NEW_SESSION
            </button>
          </div>
        </div>

        {showBriefing && (
          <div className="max-h-[45%] overflow-y-auto border-b border-[var(--color-border-default)] lg:hidden">
            <PracticeSentinelPanel sentinel={sentinel} />
          </div>
        )}

        <div ref={scrollRef} className="terminal-scrollbar flex-1 space-y-5 overflow-y-auto p-4">
          {messages.length === 0 && !isAttacking ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <Swords className="h-8 w-8 text-[var(--color-text-muted)] opacity-40" />
              <p className="text-sm text-[var(--color-text-muted)]">
                Send a message to start attacking this sentinel.
              </p>
              <p className="max-w-md text-xs text-[var(--color-text-muted)]">
                <span className="text-accent">Goal:</span>{' '}
                {sentinel.attack_goal || 'Break the sentinel’s defenses.'}
              </p>
            </div>
          ) : (
            messages.map((message, i) => <PracticeAttackMessage key={i} message={message} />)
          )}

          {isAttacking && (
            <div className="industrial-header flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              SENTINEL_IS_RESPONDING…
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-[var(--color-border-default)] p-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Type your attack prompt… (Enter to send, Shift+Enter for newline)"
              className="terminal-scrollbar max-h-40 min-h-[44px] w-full resize-none border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-3 py-3 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-white/45 focus:outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isAttacking}
              className="flex h-[44px] w-[44px] shrink-0 items-center justify-center border border-white bg-white text-black transition-all hover:bg-transparent hover:text-white disabled:cursor-not-allowed disabled:border-[var(--color-border-default)] disabled:bg-transparent disabled:text-[var(--color-text-muted)]"
              aria-label="Send attack"
            >
              {isAttacking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
