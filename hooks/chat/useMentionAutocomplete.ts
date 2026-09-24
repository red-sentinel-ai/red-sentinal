import {
  useEffect,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from 'react'
import { useDebounce } from 'use-debounce'
import { useMentionSuggestions } from './useMentionSuggestions'
import type { MentionUser } from '@/types/chat'

// An in-progress mention ends at the caret: `@` at the start or after a
// non-username character, followed by the username being typed.
const ACTIVE_MENTION_REGEX = /(?:^|[^a-zA-Z0-9_-])@([a-zA-Z0-9_-]*)$/
const SUGGESTIONS_DEBOUNCE_MS = 150

interface ActiveMention {
  query: string
  atSignIndex: number
  caretIndex: number
}

function detectMentionAtCaret(text: string, caretIndex: number): ActiveMention | null {
  const textBeforeCaret = text.slice(0, caretIndex)
  const match = textBeforeCaret.match(ACTIVE_MENTION_REGEX)
  if (!match) return null

  const query = match[1]
  return { query, atSignIndex: caretIndex - query.length - 1, caretIndex }
}

interface UseMentionAutocompleteParams {
  value: string
  onChange: (nextValue: string) => void
  textareaRef: RefObject<HTMLTextAreaElement | null>
}

export function useMentionAutocomplete({
  value,
  onChange,
  textareaRef,
}: UseMentionAutocompleteParams) {
  const [activeMention, setActiveMention] = useState<ActiveMention | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(0)

  const [debouncedQuery] = useDebounce(activeMention?.query ?? null, SUGGESTIONS_DEBOUNCE_MS)
  const { data: suggestions = [], isFetching } = useMentionSuggestions(
    activeMention ? debouncedQuery : null
  )

  useEffect(() => {
    setHighlightedIndex(0)
  }, [debouncedQuery])

  const isLoading = isFetching && suggestions.length === 0
  const isOpen = activeMention !== null && (suggestions.length > 0 || isLoading)

  function closeSuggestions() {
    setActiveMention(null)
  }

  function syncMentionFromTextarea(textarea: HTMLTextAreaElement) {
    const caretIndex = textarea.selectionStart ?? textarea.value.length
    setActiveMention(detectMentionAtCaret(textarea.value, caretIndex))
  }

  function moveHighlight(step: number) {
    setHighlightedIndex(current => {
      if (suggestions.length === 0) return current
      return (current + step + suggestions.length) % suggestions.length
    })
  }

  function selectSuggestion(user: MentionUser) {
    if (!activeMention) return

    const textBeforeMention = value.slice(0, activeMention.atSignIndex)
    const textAfterCaret = value.slice(activeMention.caretIndex)
    const insertedMention = `@${user.username} `
    onChange(`${textBeforeMention}${insertedMention}${textAfterCaret}`)
    closeSuggestions()

    const caretAfterMention = activeMention.atSignIndex + insertedMention.length
    requestAnimationFrame(() => {
      const textarea = textareaRef.current
      if (!textarea) return
      textarea.focus()
      textarea.setSelectionRange(caretAfterMention, caretAfterMention)
    })
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>): boolean {
    if (!isOpen) return false

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        moveHighlight(1)
        return true
      case 'ArrowUp':
        event.preventDefault()
        moveHighlight(-1)
        return true
      case 'Enter':
      case 'Tab': {
        const highlightedUser = suggestions[highlightedIndex]
        if (!highlightedUser) return false
        event.preventDefault()
        selectSuggestion(highlightedUser)
        return true
      }
      case 'Escape':
        event.preventDefault()
        closeSuggestions()
        return true
      default:
        return false
    }
  }

  return {
    isOpen,
    isLoading,
    suggestions,
    highlightedIndex,
    setHighlightedIndex,
    syncMentionFromTextarea,
    handleKeyDown,
    selectSuggestion,
    closeSuggestions,
  }
}
