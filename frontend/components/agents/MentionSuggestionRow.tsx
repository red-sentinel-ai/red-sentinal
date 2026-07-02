'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { cn, generateAvatarUrl } from '@/lib/utils'
import type { MentionUser } from '@/types/chat'

interface MentionSuggestionRowProps {
  user: MentionUser
  isHighlighted: boolean
  onSelect: (user: MentionUser) => void
  onHighlight: () => void
}

export function MentionSuggestionRow({
  user,
  isHighlighted,
  onSelect,
  onHighlight,
}: MentionSuggestionRowProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isHighlighted) {
      buttonRef.current?.scrollIntoView({ block: 'nearest' })
    }
  }, [isHighlighted])

  return (
    <button
      ref={buttonRef}
      type="button"
      onMouseDown={event => event.preventDefault()}
      onClick={() => onSelect(user)}
      onMouseEnter={onHighlight}
      className={cn(
        'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors',
        isHighlighted
          ? 'bg-[var(--color-accent-muted)]'
          : 'hover:bg-[var(--color-bg-elevated)]'
      )}
    >
      <Image
        src={user.avatar_url || generateAvatarUrl(user.username, 'user')}
        width={28}
        height={28}
        alt={user.username}
        className="h-7 w-7 shrink-0 overflow-hidden border border-[var(--color-border-strong)] object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-[12px] text-white">
          {user.display_name || user.username}
        </p>
        <p className="truncate font-mono text-[10px] text-[var(--color-text-muted)]">
          @{user.username}
        </p>
      </div>
    </button>
  )
}
