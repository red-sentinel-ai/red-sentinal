'use client'

import { useState } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { waitForTransactionReceipt } from '@wagmi/core'
import { parseUnits } from 'viem'
import { wagmiConfig } from '@/lib/wagmi'
import { SYNDICATE_ABI, ERC20_ABI } from '@/lib/evm/abi'

export function useSyndicateOwnerActions(syndicateAddress: `0x${string}`) {
  const { address: walletAddress, chain } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const txArgs = { account: walletAddress!, chain: chain ?? null }

  const exec = async (key: string, fn: () => Promise<`0x${string}`>) => {
    setLoading(key)
    setError(null)
    try {
      const hash = await fn()
      await waitForTransactionReceipt(wagmiConfig, { hash })
      return hash
    } catch (err: any) {
      const msg = err?.shortMessage ?? err?.message ?? 'Transaction failed'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(null)
    }
  }

  const fundAgent = (tokenAddress: `0x${string}`, amount: string, decimals: number) =>
    exec('fundAgent', async () => {
      const amountRaw = parseUnits(amount, decimals)

      const approveTx = await writeContractAsync({
        ...txArgs,
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [syndicateAddress, amountRaw],
      })
      await waitForTransactionReceipt(wagmiConfig, { hash: approveTx })

      return writeContractAsync({
        ...txArgs,
        address: syndicateAddress,
        abi: SYNDICATE_ABI,
        functionName: 'fundAgent',
        args: [amountRaw],
      })
    })

  const withdrawFromSentinel = (amount: string, decimals: number) =>
    exec('withdraw', () =>
      writeContractAsync({
        ...txArgs,
        address: syndicateAddress,
        abi: SYNDICATE_ABI,
        functionName: 'withdrawFromSentinel',
        args: [parseUnits(amount, decimals)],
      })
    )

  const setWhitelistEnabled = (enabled: boolean) =>
    exec('whitelist', () =>
      writeContractAsync({
        ...txArgs,
        address: syndicateAddress,
        abi: SYNDICATE_ABI,
        functionName: 'setWhitelistEnabled',
        args: [enabled],
      })
    )

  const whitelistAddresses = (addresses: `0x${string}`[], isWhitelisted: boolean) =>
    exec('whitelistAddrs', () =>
      writeContractAsync({
        ...txArgs,
        address: syndicateAddress,
        abi: SYNDICATE_ABI,
        functionName: 'setContributorsWhitelisted',
        args: [addresses, isWhitelisted],
      })
    )

  return {
    fundAgent,
    withdrawFromSentinel,
    setWhitelistEnabled,
    whitelistAddresses,
    loading,
    error,
  }
}
