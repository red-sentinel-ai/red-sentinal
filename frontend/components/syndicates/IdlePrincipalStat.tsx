'use client'

import { formatUnits } from 'viem'
import { useReadContract } from 'wagmi'
import { Skeleton } from '@/components/ui/skeleton'
import { SYNDICATE_ABI } from '@/lib/evm/abi'

interface IdlePrincipalStatProps {
  address: `0x${string}`
  tokenSymbol: string
}

export function IdlePrincipalStat({ address, tokenSymbol }: IdlePrincipalStatProps) {
  const { data, isLoading } = useReadContract({
    address,
    abi: SYNDICATE_ABI,
    functionName: 'idlePrincipal',
  })

  if (isLoading) return <Skeleton className="mt-0.5 h-4 w-20" />

  const formatted =
    data !== undefined
      ? `${parseFloat(formatUnits(data as bigint, 18)).toFixed(2)} ${tokenSymbol}`
      : '—'

  return (
    <div className="mt-0.5 font-mono text-sm text-[var(--color-text-primary)]">{formatted}</div>
  )
}
