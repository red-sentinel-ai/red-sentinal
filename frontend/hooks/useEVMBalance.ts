'use client'

import { useBalance } from 'wagmi'
import { formatUnits } from 'viem'
import { useEVMWallet } from '@/hooks/useEVMWallet'
import { isNativeToken } from '@/lib/evm/native-token'

export function useEVMBalance(tokenAddress?: `0x${string}`) {
  const { address } = useEVMWallet()
  const erc20Address = isNativeToken(tokenAddress) ? undefined : tokenAddress
  const { data, isLoading } = useBalance({ address, token: erc20Address })

  return {
    balance: data ? parseFloat(formatUnits(data.value, data.decimals)) : null,
    isLoading,
  }
}
