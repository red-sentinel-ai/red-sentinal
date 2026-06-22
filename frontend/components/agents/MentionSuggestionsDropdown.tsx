'use client'

import { Loader2 } from 'lucide-react'
import { MentionSuggestionRow } from './MentionSuggestionRow'
import type { MentionUser } from '@/types/chat'

interface MentionSuggestionsDropdownProps {
  isOpen: boolean
  isLoading: boolean
  suggestions: MentionUser[]
  highlightedIndex: number
  onSelect: (user: MentionUser) => void
  onHighlight: (index: number) => void
}

export function MentionSuggestionsDropdown({
  isOpen,
  isLoading,
  suggestions,
  highlightedIndex,
  onSelect,
  onHighlight,
}: MentionSuggestionsDropdownProps) {
  if (!isOpen) return null

  return (
    <div className="absolute bottom-full left-0 right-0 z-50 mb-2 max-h-64 overflow-y-auto border border-[var(--color-border-strong)] bg-[var(--color-bg-base)] shadow-lg">
      {isLoading && suggestions.length === 0 ? (
        <div className="flex items-center gap-2 px-3 py-3 text-[var(--color-text-muted)]">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span className="font-mono text-[11px]">Searching users…</span>
        </div>
      ) : (
        suggestions.map((user, index) => (
          <MentionSuggestionRow
            key={user.id}
            user={user}
            isHighlighted={index === highlightedIndex}
            onSelect={onSelect}
            onHighlight={() => onHighlight(index)}
          />
        ))
      )}
    </div>
  )
}
