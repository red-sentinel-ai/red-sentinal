'use client'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { Loader2, Lock, Wallet } from 'lucide-react'

import { formatTokenAmount } from '@/lib/utils'
import {
  getDecimalsForSymbol,
  getSyndicateBasePath,
  getSyndicateIdlePrincipalWei,
} from '@/lib/syndicate-utils'
import { useSyndicateData } from '@/hooks/syndicate/useSyndicateData'
import { useSyndicatePendingFees } from '@/hooks/syndicate/useSyndicateInfo'
import { useCanAccessSyndicateChat } from '@/hooks/syndicate-chat'
import { SyndicateChatSidebar } from '@/components/syndicate/SyndicateChatSidebar'
import { SyndicateChatRoom } from '@/components/syndicate/SyndicateChatRoom'

interface Props {
  identifier: string
}

function ChatPageNotice({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center gap-4 bg-[var(--color-bg-base)] px-6 text-center">
      {children}
    </div>
  )
}

export default function SyndicateChatPageClient({ identifier }: Props) {
  const router = useRouter()
  const { address: connectedAddress } = useAccount()

  const { data: syndicateData, isLoading: isSyndicateLoading, isError } =
    useSyndicateData(identifier)
  const syndicate = syndicateData?.syndicate

  const syndicateAddress = syndicate?.contract_address as `0x${string}` | undefined
  const tokenSymbol = syndicate?.token_symbol ?? 'TOKEN'
  const tokenDecimals = syndicate
    ? getDecimalsForSymbol(syndicate.token_symbol, syndicate.token_address)
    : 18

  const { data: accessData, isLoading: isAccessLoading } =
    useCanAccessSyndicateChat(syndicateAddress, connectedAddress)
  const { pendingFees } = useSyndicatePendingFees(syndicateAddress, connectedAddress)

  const goToSyndicate = () =>
    router.push(syndicate ? getSyndicateBasePath(syndicate) : '/syndicates')

  if (isSyndicateLoading) {
    return (
      <ChatPageNotice>
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-text-muted)]" />
      </ChatPageNotice>
    )
  }

  if (isError || !syndicate || !syndicateAddress) {
    return (
      <ChatPageNotice>
        <p className="text-sm text-[var(--color-text-muted)]">Syndicate not found.</p>
      </ChatPageNotice>
    )
  }

  if (!connectedAddress) {
    return (
      <ChatPageNotice>
        <Wallet className="h-12 w-12 text-[var(--color-text-muted)]" />
        <p className="text-sm text-[var(--color-text-muted)]">
          Connect your wallet to access this syndicate&apos;s private chat.
        </p>
      </ChatPageNotice>
    )
  }

  if (isAccessLoading) {
    return (
      <ChatPageNotice>
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-text-muted)]" />
      </ChatPageNotice>
    )
  }

  if (!accessData?.can_access) {
    return (
      <ChatPageNotice>
        <Lock className="h-12 w-12 text-[var(--color-gold-primary)]" />
        <p className="text-sm text-[var(--color-text-muted)]">
          This chat is private to syndicate members. Join the syndicate to participate.
        </p>
        <button onClick={goToSyndicate} className="button-ghost-terminal mt-2 px-6 py-3">
          View Syndicate
        </button>
      </ChatPageNotice>
    )
  }

  const formattedTVL = formatTokenAmount(syndicate.total_funds, tokenDecimals)
  const formattedIdle = formatTokenAmount(
    getSyndicateIdlePrincipalWei(syndicate).toString(),
    tokenDecimals
  )
  const formattedPendingFees =
    pendingFees !== undefined ? formatTokenAmount(pendingFees.toString(), tokenDecimals) : null

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[var(--color-bg-base)]">
      <aside className="hidden w-[360px] shrink-0 border-r border-[var(--color-border-strong)] lg:block">
        <SyndicateChatSidebar
          syndicate={syndicate}
          tokenSymbol={tokenSymbol}
          formattedTVL={formattedTVL}
          formattedIdle={formattedIdle}
          formattedPendingFees={formattedPendingFees}
        />
      </aside>
      <div className="min-w-0 flex-1">
        <SyndicateChatRoom syndicateAddress={syndicateAddress} onBack={goToSyndicate} />
      </div>
    </div>
  )
}
