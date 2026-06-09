'use client'

import { useActiveChain } from '@/context/ActiveChainContext'
import { isEvmChain } from '@/constants/chains'
import { SuiConnectButton } from '@/components/SuiConnectButton'
import { SolanaConnectButton } from '@/components/SolanaConnectButton'
import { EVMConnectButton } from '@/components/EVMConnectButton'

export const ConnectButton = () => {
  const { activeChain, isHydrated } = useActiveChain()

  // Wait for hydration to prevent showing wrong wallet button
  if (!isHydrated) {
    return (
      <button disabled className="rs-connect-button min-w-[180px] px-6 py-2 opacity-50">
        Connect Wallet
      </button>
    )
  }

  if (activeChain === 'solana') return <SolanaConnectButton />
  if (isEvmChain(activeChain)) return <EVMConnectButton />
  return <SuiConnectButton />
}
