'use client'

import { useState } from 'react'
import { Users, Crown, Swords } from 'lucide-react'
import { toast } from 'sonner'
import { ConnectModal } from '@mysten/dapp-kit'

import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import {
  useChatMessages,
  useSendChatMessage,
  useCanSendMessage,
  useChatSubscription,
} from '@/hooks/chat'
import type { AgentDetailsFull } from '@/hooks/agents/useAgentDetails'
import type { ChatRoleStyleMap } from '@/components/chat/types'
import { ChatRoomView } from '@/components/chat/ChatRoomView'

interface ChatRoomProps {
  agent: AgentDetailsFull
  onBack: () => void
}

const SENTINEL_ROLE_STYLES: ChatRoleStyleMap = {
  owner: { icon: Crown, label: 'OWNER', color: 'text-[var(--color-gold-primary)]' },
  attacker: { icon: Swords, label: 'ATTACKER', color: 'text-[var(--color-danger)]' },
  syndicate_member: { icon: Users, label: 'SYNDICATE', color: 'text-[var(--color-accent)]' },
}

const PERMISSION_HINT =
  'You must be the agent owner, have made at least one attack, or be a syndicate member to send messages.'
const PERMISSION_TOAST =
  'You must be an owner, attacker, or syndicate member to send messages'

export function ChatRoom({ agent, onBack }: ChatRoomProps) {
  const { address: connectedAddress } = useConnectedAddress()
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)

  const { data: chatData, isLoading, refetch } = useChatMessages(agent.agent_id)
  const { data: canSendData } = useCanSendMessage(agent.agent_id, connectedAddress || undefined)
  const { mutateAsync: sendMessage, isPending: isSending } = useSendChatMessage()

  // Real-time updates; falls back to the hook's polling until a room_id exists.
  const roomId = chatData?.messages?.[0]?.room_id
  const { isConnected } = useChatSubscription({
    roomId,
    agentId: agent.agent_id,
    onNewMessage: () => refetch(),
  })

  const handleSend = async (content: string) => {
    if (!connectedAddress) return false
    try {
      await sendMessage({ agentId: agent.agent_id, content, senderAddress: connectedAddress })
      return true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send message')
      return false
    }
  }

  return (
    <>
      <ChatRoomView
        headerLabel="COMMUNITY_CHAT"
        messages={chatData?.messages ?? []}
        totalMessages={chatData?.total ?? 0}
        isLoadingMessages={isLoading}
        isLive={isConnected}
        canSend={canSendData?.can_send ?? false}
        userRole={canSendData?.role}
        roleStyles={SENTINEL_ROLE_STYLES}
        permissionHint={PERMISSION_HINT}
        permissionToast={PERMISSION_TOAST}
        connectedAddress={connectedAddress || undefined}
        onRequestConnect={() => setIsWalletModalOpen(true)}
        isSending={isSending}
        onSend={handleSend}
        onBack={onBack}
      />
      <ConnectModal
        open={isWalletModalOpen}
        onOpenChange={setIsWalletModalOpen}
        trigger={<span className="hidden" />}
      />
    </>
  )
}
