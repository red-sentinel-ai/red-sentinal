import { useEffect, useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabaseBrowser } from '@/lib/supabase-browser'
import type { ChatMessage } from '@/types/chat'
import { CHAT_MESSAGES_QUERY_KEY } from './useChatMessages'
import { APP_NETWORK } from '@/constants'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseChatSubscriptionOptions {
  roomId?: string
  agentId?: string
  onNewMessage?: (message: ChatMessage) => void
}

export function useChatSubscription({
  roomId,
  agentId,
  onNewMessage,
}: UseChatSubscriptionOptions) {
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  const handleNewMessage = useCallback(
    (payload: { new: ChatMessage }) => {
      const newMessage = payload.new

      // Call the callback if provided
      onNewMessage?.(newMessage)

      // Invalidate the query to refetch
      if (agentId) {
        queryClient.invalidateQueries({
          queryKey: [CHAT_MESSAGES_QUERY_KEY, agentId, APP_NETWORK],
        })
      }
    },
    [agentId, queryClient, onNewMessage]
  )

  useEffect(() => {
    if (!roomId) {
      return
    }

    const channelName = `room:${roomId}`
    const newChannel = supabaseBrowser
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'sentinel',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        handleNewMessage
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    setChannel(newChannel)

    return () => {
      newChannel.unsubscribe()
      setChannel(null)
      setIsConnected(false)
    }
  }, [roomId, handleNewMessage])

  const unsubscribe = useCallback(() => {
    channel?.unsubscribe()
    setChannel(null)
    setIsConnected(false)
  }, [channel])

  return {
    isConnected,
    unsubscribe,
  }
}
