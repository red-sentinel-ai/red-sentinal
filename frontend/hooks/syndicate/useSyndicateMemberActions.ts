'use client'

import { useState } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { waitForTransactionReceipt } from '@wagmi/core'
import { parseUnits } from 'viem'
import { wagmiConfig } from '@/lib/wagmi'
import { SYNDICATE_ABI, ERC20_ABI } from '@/lib/evm/abi'
import { APP_NETWORK } from '@/constants/shared'
import { SUI_SENTINEL_API_URL } from '@/constants'

export function useSyndicateMemberActions(syndicateAddress: `0x${string}`) {
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

  const deposit = (tokenAddress: `0x${string}`, amount: string, decimals: number) =>
    exec('deposit', async () => {
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
        functionName: 'deposit',
        args: [amountRaw],
      })
    })

  const redeem = (shares: bigint) =>
    exec('redeem', () =>
      writeContractAsync({
        ...txArgs,
        address: syndicateAddress,
        abi: SYNDICATE_ABI,
        functionName: 'redeem',
        args: [shares],
      })
    )

  const claimFeesForSyndicate = () =>
    exec('claimForSyndicate', () =>
      writeContractAsync({
        ...txArgs,
        address: syndicateAddress,
        abi: SYNDICATE_ABI,
        functionName: 'claimCreatorFeesFromSentinel',
        args: [],
      })
    )

  const claimFeesForSelf = () =>
    exec('claimSelf', () =>
      writeContractAsync({
        ...txArgs,
        address: syndicateAddress,
        abi: SYNDICATE_ABI,
        functionName: 'claimFees',
        args: [],
      })
    )

  const requestToJoin = async (message: string) => {
    if (!walletAddress) throw new Error('Wallet not connected')
    setLoading('joinRequest')
    setError(null)
    try {
      const res = await fetch(`${SUI_SENTINEL_API_URL}/syndicates/join-request`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syndicate_address: syndicateAddress,
          requester_address: walletAddress,
          message,
          network: APP_NETWORK,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send request')
      }
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(null)
    }
  }

  return {
    deposit,
    redeem,
    claimFeesForSyndicate,
    claimFeesForSelf,
    requestToJoin,
    loading,
    error,
  }
}
