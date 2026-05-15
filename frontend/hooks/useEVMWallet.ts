'use client'

import { useAccount, useDisconnect } from 'wagmi'

/**
 * Single import point for EVM wallet state — mirrors the useSolanaWallet pattern.
 */
export function useEVMWallet() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  return { address, isConnected, disconnect }
}
