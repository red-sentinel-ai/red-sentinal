'use client'

import { useBalance } from 'wagmi'
import { formatUnits } from 'viem'
import { useEVMWallet } from '@/hooks/useEVMWallet'

/**
 * Returns the native BNB balance for the connected EVM wallet.
 * Mirrors the useSolanaBalance return shape { balance, isLoading }.
 */
export function useEVMBalance() {
  const { address } = useEVMWallet()
  const { data, isLoading } = useBalance({ address })

  return {
    balance: data ? parseFloat(formatUnits(data.value, data.decimals)) : null,
    isLoading,
  }
}
