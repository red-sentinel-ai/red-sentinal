'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { Loader2, MessageCircle, SendHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { TemplateComment } from '@/types'
import { generateAvatarUrl } from '@/lib/utils'

interface TemplateCommentsProps {
  templateId: number
  onConnectRequest?: () => void
  onCountChange?: (delta: number) => void
}

const MAX_COMMENT_LENGTH = 1000

export function TemplateComments({ templateId, onConnectRequest, onCountChange }: TemplateCommentsProps) {
  const account = useCurrentAccount()
  const wallet = account?.address?.toLowerCase()

  const [comments, setComments] = useState<TemplateComment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draft, setDraft] = useState('')

  const countChangeRef = useRef(onCountChange)
  countChangeRef.current = onCountChange

  useEffect(() => {
    let cancelled = false
    const fetchComments = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/templates/${templateId}/comments`)
        const data = await res.json()
        if (!cancelled && Array.isArray(data)) {
          setComments(data)
        }
      } catch (err) {
        console.error('Error fetching template comments:', err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchComments()
    return () => {
      cancelled = true
    }
  }, [templateId])

  const handleSubmit = async () => {
    const trimmed = draft.trim()
    if (!wallet) {
      onConnectRequest?.()
      return
    }
    if (!trimmed || isSubmitting) return

    try {
      setIsSubmitting(true)
      const res = await fetch(`/api/templates/${templateId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, comment: trimmed }),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to post comment')
      }
      const { comment } = await res.json()
      setComments(prev => [...prev, comment])
      setDraft('')
      countChangeRef.current?.(1)
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <MessageCircle className="h-3.5 w-3.5 text-[var(--color-info)]" />
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h3>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] py-8">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--color-text-muted)]" />
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
          No comments yet. Be the first to share your thoughts.
        </div>
      ) : (
        <div className="max-h-80 space-y-3 overflow-y-auto rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4">
          {comments.map(comment => (
            <CommentRow key={comment.id} comment={comment} />
          ))}
        </div>
      )}

      <div className="mt-3">
        {wallet ? (
          <div className="flex items-end gap-2 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-3 transition-colors focus-within:border-[var(--color-gold-primary)]">
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              rows={2}
              placeholder="Add a comment... (⌘+Enter to post)"
              className="w-full resize-none bg-transparent text-sm leading-[1.75] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !draft.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-gold-primary)] text-[var(--color-text-on-gold)] transition-all hover:bg-[var(--color-gold-light)] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Post comment"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onConnectRequest?.()}
            className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] px-4 py-3 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-gold-primary)] hover:text-[var(--color-text-primary)]"
          >
            Connect your wallet to join the discussion
          </button>
        )}
      </div>
    </div>
  )
}

function CommentRow({ comment }: { comment: TemplateComment }) {
  const displayName = comment.display_name || comment.username || `${comment.user_address.slice(0, 6)}…${comment.user_address.slice(-4)}`

  return (
    <div className="flex gap-3">
      <Image
        src={comment.avatar_url || generateAvatarUrl(comment.user_address)}
        alt={displayName}
        width={32}
        height={32}
        className="h-8 w-8 shrink-0 rounded-full border border-[var(--color-border-subtle)] object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-sm font-medium text-[var(--color-text-primary)]">{displayName}</span>
          <span className="shrink-0 text-xs text-[var(--color-text-faint)]">{timeAgo(comment.created_at)}</span>
        </div>
        <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {comment.comment}
        </p>
      </div>
    </div>
  )
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}
