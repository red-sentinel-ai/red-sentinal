'use client'

import { useCurrentAccount } from '@mysten/dapp-kit'
import { useActiveChain } from '@/context/ActiveChainContext'
import { useSolanaWallet } from '@/hooks/useSolanaWallet'
import { useStellarWallet } from '@/hooks/useStellarWallet'
import { useEVMWallet } from '@/hooks/useEVMWallet'
import { isEvmChain, type SupportedChain } from '@/constants/chains'

export type ConnectedAddress = {
  address: string | undefined
  chain: SupportedChain
  isConnected: boolean
  isHydrated: boolean
}

/**
 * Returns the wallet address for the chain the user has currently selected.
 * Profile/agents/activity surfaces should use this so users on different chains
 * only see their own data.
 */
export function useConnectedAddress(): ConnectedAddress {
  const { activeChain, isHydrated } = useActiveChain()
  const suiAccount = useCurrentAccount()
  const { publicKey } = useSolanaWallet()
  const { address: stellarAddress } = useStellarWallet()
  const { address: evmAddress } = useEVMWallet()

  let address: string | undefined
  if (activeChain === 'solana') {
    address = publicKey?.toBase58() ?? undefined
  } else if (activeChain === 'stellar') {
    address = stellarAddress ?? undefined
  } else if (isEvmChain(activeChain)) {
    address = evmAddress
  } else {
    address = suiAccount?.address
  }

  return {
    address,
    chain: activeChain,
    isConnected: !!address,
    isHydrated,
  }
}
