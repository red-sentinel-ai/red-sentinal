'use client'

import { useActiveChain } from '@/context/ActiveChainContext'
import { isEvmChain } from '@/constants/chains'
import { SuiConnectButton } from '@/components/SuiConnectButton'
import { SolanaConnectButton } from '@/components/SolanaConnectButton'
import { EVMConnectButton } from '@/components/EVMConnectButton'

export const ConnectButton = () => {
  const { activeChain } = useActiveChain()
  if (activeChain === 'solana') return <SolanaConnectButton />
  if (isEvmChain(activeChain)) return <EVMConnectButton />
  return <SuiConnectButton />
}
