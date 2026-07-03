import { useMemo } from 'react'

import type { ChatMessage as ChatMessageType } from '@/components/agents/ChatInterface'
import type { PracticeAttacksFeedResponse } from '@/types/practice'

function toEpochMs(iso: string | null): string {
  if (!iso) return Date.now().toString()
  const ms = new Date(iso).getTime()
  return Number.isFinite(ms) ? ms.toString() : Date.now().toString()
}

export function useAttackFeedMessages(
  feed: PracticeAttacksFeedResponse | undefined,
  pendingRound: ChatMessageType[] | null
): { messages: ChatMessageType[]; isRoundIndexed: boolean } {
  const serverMessages = useMemo<ChatMessageType[]>(() => {
    const items = [...(feed?.messages ?? [])].reverse()
    const msgs: ChatMessageType[] = []
    for (const item of items) {
      const ts = toEpochMs(item.timestamp)
      msgs.push({
        id: `user-${item.id}`,
        type: 'user',
        content: item.content,
        timestamp: ts,
        sender: item.sender ?? undefined,
      })
      msgs.push({
        id: `agent-${item.id}`,
        type: 'agent',
        content: item.agent_response,
        timestamp: ts,
        isSuccess: item.success ?? undefined,
        score: item.score ?? undefined,
        juryResponse: item.jury_response ?? undefined,
      })
    }
    return msgs
  }, [feed])

  const isRoundIndexed = useMemo(() => {
    if (!pendingRound) return false
    const optimisticUser = pendingRound[0]
    return serverMessages.some(
      m =>
        m.type === 'user' &&
        m.sender === optimisticUser.sender &&
        m.content === optimisticUser.content
    )
  }, [serverMessages, pendingRound])

  const messages = useMemo<ChatMessageType[]>(() => {
    if (!pendingRound || isRoundIndexed) return serverMessages
    return [...serverMessages, ...pendingRound]
  }, [serverMessages, pendingRound, isRoundIndexed])

  return { messages, isRoundIndexed }
}
