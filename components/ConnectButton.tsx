'use client'

import type { RefObject } from 'react'
import { useActiveChain } from '@/context/ActiveChainContext'
import { isEvmChain } from '@/constants/chains'
import { cn } from '@/lib/utils'
import { ConnectWalletLabel } from '@/components/ConnectWalletLabel'
import { SuiConnectButton } from '@/components/SuiConnectButton'
import { SolanaConnectButton } from '@/components/SolanaConnectButton'
import { EVMConnectButton } from '@/components/EVMConnectButton'

interface ConnectButtonProps {
  /** Shrink to a wallet icon below `md` — for the app topbar. */
  compact?: boolean
  /** Optional element the connected-wallet menu aligns to instead of the button itself. */
  anchorRef?: RefObject<HTMLElement | null>
}

export const ConnectButton = ({ compact, anchorRef }: ConnectButtonProps) => {
  const { activeChain, isHydrated } = useActiveChain()

  // Wait for hydration to prevent showing wrong wallet button
  if (!isHydrated) {
    return (
      <button
        disabled
        className={cn(
          'rs-connect-button py-2 opacity-50',
          compact ? 'px-3 md:min-w-[180px] md:px-6' : 'min-w-[180px] px-6'
        )}
      >
        <ConnectWalletLabel compact={compact} />
      </button>
    )
  }

  if (activeChain === 'solana') return <SolanaConnectButton compact={compact} anchorRef={anchorRef} />
  if (isEvmChain(activeChain)) return <EVMConnectButton compact={compact} anchorRef={anchorRef} />
  return <SuiConnectButton compact={compact} anchorRef={anchorRef} />
}
