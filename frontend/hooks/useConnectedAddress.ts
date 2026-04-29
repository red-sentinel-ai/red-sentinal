'use client'

import { useCurrentAccount } from '@mysten/dapp-kit'
import { useActiveChain } from '@/context/ActiveChainContext'
import { useSolanaWallet } from '@/hooks/useSolanaWallet'
import type { SupportedChain } from '@/constants/chains'

export type ConnectedAddress = {
  address: string | undefined
  chain: SupportedChain
  isConnected: boolean
}

/**
 * Returns the wallet address for the chain the user has currently selected.
 * When activeChain is 'solana', returns the Solana publicKey; otherwise the
 * Sui account address. Profile/agents/activity surfaces should use this so a
 * Solana user doesn't see Sui data and vice versa.
 */
export function useConnectedAddress(): ConnectedAddress {
  const { activeChain } = useActiveChain()
  const suiAccount = useCurrentAccount()
  const { publicKey } = useSolanaWallet()

  const address =
    activeChain === 'solana' ? (publicKey?.toBase58() ?? undefined) : suiAccount?.address

  return {
    address,
    chain: activeChain,
    isConnected: !!address,
  }
}
