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

export function useSyndicateContractInfo(syndicateAddress: `0x${string}` | undefined) {
  const enabled = !!syndicateAddress

  const contracts = [
    { address: syndicateAddress!, abi: SYNDICATE_ABI, functionName: 'owner' },
    { address: syndicateAddress!, abi: SYNDICATE_ABI, functionName: 'agentId' },
    { address: syndicateAddress!, abi: SYNDICATE_ABI, functionName: 'whitelistEnabled' },
    { address: syndicateAddress!, abi: SYNDICATE_ABI, functionName: 'token' },
    { address: syndicateAddress!, abi: SYNDICATE_ABI, functionName: 'totalShares' },
    { address: syndicateAddress!, abi: SYNDICATE_ABI, functionName: 'idlePrincipal' },
    { address: syndicateAddress!, abi: SYNDICATE_ABI, functionName: 'totalManagedAssets' },
  ] as const

  const { data, isLoading } = useReadContracts({
    contracts,
    query: { enabled },
  })

  if (!enabled || !data) return { owner: undefined, agentId: undefined, whitelistEnabled: undefined, tokenAddress: undefined, totalShares: undefined, idlePrincipal: undefined, totalManagedAssets: undefined, isLoading }

  return {
    owner: data[0].result as `0x${string}` | undefined,
    agentId: data[1].result as string | undefined,
    whitelistEnabled: data[2].result as boolean | undefined,
    tokenAddress: data[3].result as `0x${string}` | undefined,
    totalShares: data[4].result as bigint | undefined,
    idlePrincipal: data[5].result as bigint | undefined,
    totalManagedAssets: data[6].result as bigint | undefined,
    isLoading,
  }
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
