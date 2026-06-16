'use client'

import { useBalance } from 'wagmi'
import { formatUnits } from 'viem'
import { useEVMWallet } from '@/hooks/useEVMWallet'

/**
 * Returns the balance for the connected EVM wallet.
 * Pass a tokenAddress to get an ERC-20 token balance; omit it for the native gas token.
 */
export function useEVMBalance(tokenAddress?: `0x${string}`) {
  const { address } = useEVMWallet()
  const { data, isLoading } = useBalance({ address, token: tokenAddress })

  return {
    balance: data ? parseFloat(formatUnits(data.value, data.decimals)) : null,
    isLoading,
  }
}
