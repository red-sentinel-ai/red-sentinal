'use client'

import { useReadContract, useReadContracts } from 'wagmi'
import { SYNDICATE_ABI, SENTINEL_ABI } from '@/lib/evm/abi'
import { BNB_CONFIG } from '@/constants/evm'

export interface SyndicateContractInfo {
  owner: `0x${string}` | undefined
  agentId: string | undefined
  whitelistEnabled: boolean | undefined
  tokenAddress: `0x${string}` | undefined
  totalShares: bigint | undefined
  idlePrincipal: bigint | undefined
  totalManagedAssets: bigint | undefined
  isLoading: boolean
}

export function useSyndicateMemberInfo(
  syndicateAddress: `0x${string}` | undefined,
  memberAddress: `0x${string}` | undefined
) {
  const enabled = !!syndicateAddress && !!memberAddress

  const contracts = [
    { address: syndicateAddress!, abi: SYNDICATE_ABI, functionName: 'sharesOf', args: [memberAddress!] },
    { address: syndicateAddress!, abi: SYNDICATE_ABI, functionName: 'pendingFees', args: [memberAddress!] },
    { address: syndicateAddress!, abi: SYNDICATE_ABI, functionName: 'contributorWhitelist', args: [memberAddress!] },
  ] as const

  const { data, isLoading } = useReadContracts({
    contracts,
    query: { enabled },
  })

  return {
    shares: enabled ? data?.[0].result as bigint | undefined : undefined,
    pendingFees: enabled ? data?.[1].result as bigint | undefined : undefined,
    isWhitelisted: enabled ? data?.[2].result as boolean | undefined : undefined,
    isLoading,
  }
}

export function useSyndicateWithdrawalUnlock(agentId: string | undefined) {
  const enabled = !!agentId

  const { data, isLoading } = useReadContract({
    address: BNB_CONFIG.contractAddress,
    abi: SENTINEL_ABI,
    functionName: 'getWithdrawalUnlockTimestamp' as any,
    args: enabled ? [agentId] : undefined,
    query: { enabled },
  })

  const unlockTimestamp = data ? Number(data as bigint) * 1000 : null
  const now = Date.now()
  const isLocked = unlockTimestamp !== null && now < unlockTimestamp
  const lockRemaining = isLocked ? unlockTimestamp - now : 0

  return { unlockTimestamp, isLocked, lockRemaining, isLoading }
}
