'use client'

import { useState } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { simulateContract, waitForTransactionReceipt } from '@wagmi/core'
import { parseUnits } from 'viem'
import { wagmiConfig } from '@/lib/wagmi'
import { SYNDICATE_ABI } from '@/lib/evm/abi'

const OWNABLE_UNAUTHORIZED_SIGNATURE = '0x118cdaa7'

function formatRevertReason(reason: string): string {
  if (
    reason.includes(OWNABLE_UNAUTHORIZED_SIGNATURE) ||
    reason.toLowerCase().includes('ownableunauthorizedaccount')
  ) {
    return 'Only the syndicate owner can perform this action.'
  }
  return reason
}

export function useSyndicateOwnerActions(
  syndicateAddress: `0x${string}`,
  ownerAddress?: string
) {
  const { address: walletAddress, chain } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const txArgs = { account: walletAddress!, chain: chain ?? null }
  const isOwner =
    !!walletAddress &&
    !!ownerAddress &&
    walletAddress.toLowerCase() === ownerAddress.toLowerCase()

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

  // Funds the sentinel FROM the syndicate's idle balance. The syndicate
  // contract already holds the tokens — no ERC20.approve from the user is
  // needed (it's the syndicate that approves the Sentinel, not the caller).
  // We simulate first so any contract revert surfaces with its real reason
  // instead of degrading to a "gas limit too high" RPC rejection.
  // `tokenAddress` is kept in the signature for caller compatibility but unused.
  const fundAgent = (_tokenAddress: `0x${string}`, amount: string, decimals: number) =>
    exec('fundAgent', async () => {
      if (!isOwner) {
        throw new Error(
          'Only the syndicate owner can add funds to the sentinel bounty pool.'
        )
      }
      const call = {
        ...txArgs,
        address: syndicateAddress,
        abi: SYNDICATE_ABI,
        functionName: 'fundAgent' as const,
        args: [parseUnits(amount, decimals)] as const,
      }
      try {
        await simulateContract(wagmiConfig, call)
      } catch (err: any) {
        const reason =
          err?.cause?.shortMessage ??
          err?.shortMessage ??
          err?.metaMessages?.join(' • ') ??
          err?.message ??
          'Simulation failed'
        throw new Error(`fundAgent would revert: ${formatRevertReason(reason)}`)
      }
      return writeContractAsync(call)
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
