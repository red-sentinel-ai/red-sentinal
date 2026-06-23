'use client'

import { Users, Crown } from 'lucide-react'
import { toast } from 'sonner'
import { useAccount } from 'wagmi'

import {
  useSyndicateChatMessages,
  useSendSyndicateChatMessage,
  useCanAccessSyndicateChat,
} from '@/hooks/syndicate-chat'
import type { ChatRoleStyleMap } from '@/components/chat/types'
import { ChatRoomView } from '@/components/chat/ChatRoomView'

interface SyndicateChatRoomProps {
  syndicateAddress: string
  onBack: () => void
}

const SYNDICATE_ROLE_STYLES: ChatRoleStyleMap = {
  owner: { icon: Crown, label: 'OWNER', color: 'text-[var(--color-gold-primary)]' },
  member: { icon: Users, label: 'MEMBER', color: 'text-[var(--color-accent)]' },
}

const PERMISSION_HINT = 'Only syndicate members can send messages in this private chat.'
const PERMISSION_TOAST = 'Only syndicate members can send messages'

export function SyndicateChatRoom({ syndicateAddress, onBack }: SyndicateChatRoomProps) {
  const { address: connectedAddress } = useAccount()

  const { data: chatData, isLoading } = useSyndicateChatMessages(
    syndicateAddress,
    connectedAddress || undefined
  )
  const { data: accessData } = useCanAccessSyndicateChat(
    syndicateAddress,
    connectedAddress || undefined
  )
  const { mutateAsync: sendMessage, isPending: isSending } = useSendSyndicateChatMessage()

  const handleSend = async (content: string) => {
    if (!connectedAddress) return false
    try {
      await sendMessage({ syndicateAddress, content, senderAddress: connectedAddress })
      return true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send message')
      return false
    }
  }

  return (
    <ChatRoomView
      headerLabel="SYNDICATE_CHAT"
      messages={chatData?.messages ?? []}
      totalMessages={chatData?.total ?? 0}
      isLoadingMessages={isLoading}
      canSend={accessData?.can_access ?? false}
      userRole={accessData?.role}
      roleStyles={SYNDICATE_ROLE_STYLES}
      permissionHint={PERMISSION_HINT}
      permissionToast={PERMISSION_TOAST}
      connectedAddress={connectedAddress}
      onRequestConnect={() => toast.error('Connect your wallet to chat')}
      isSending={isSending}
      onSend={handleSend}
      onBack={onBack}
    />
  )
}
