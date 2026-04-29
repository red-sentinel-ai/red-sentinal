'use client'

import { useActiveChain } from '@/context/ActiveChainContext'
import { SuiConnectButton } from '@/components/SuiConnectButton'
import { SolanaConnectButton } from '@/components/SolanaConnectButton'

export const ConnectButton = () => {
  const { activeChain } = useActiveChain()
  return activeChain === 'solana' ? <SolanaConnectButton /> : <SuiConnectButton />
}
