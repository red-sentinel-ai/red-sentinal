'use client'

import { useReadContract } from 'wagmi'
import { SYNDICATE_ABI } from '@/lib/evm/abi'

/**
 * Pending (unclaimed) creator-fee share for a member.
 *
 * This is the ONE value we still read over RPC: it depends on the contract's
 * feePerShare / feeDebt accounting, which the indexer doesn't reconstruct.
 * Shares, whitelist status and the withdrawal timer all come from the backend
 * syndicate record instead (see SyndicatePageClient).
 */
export function useSyndicatePendingFees(
  syndicateAddress: `0x${string}` | undefined,
  memberAddress: `0x${string}` | undefined
) {
  const enabled = !!syndicateAddress && !!memberAddress

  const { data, isLoading, refetch } = useReadContract({
    address: syndicateAddress,
    abi: SYNDICATE_ABI,
    functionName: 'pendingFees',
    args: enabled ? [memberAddress!] : undefined,
    query: { enabled },
  })

  return {
    pendingFees: enabled ? (data as bigint | undefined) : undefined,
    isLoading,
    refetch,
  }
}
