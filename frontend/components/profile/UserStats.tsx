'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { PointsHistoryChart } from '@/components/profile/PointsHistoryChart'
import { useRecipientRewards } from '@/hooks/rewards/useRecipientRewards'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'

export const UserStats = () => {
  const { address } = useConnectedAddress()
  const { data, isLoading } = useRecipientRewards(address)

  const history = data?.result || []

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-6 shadow-[var(--shadow-card)]">
        <Skeleton className="mb-4 h-6 w-32 bg-[var(--color-border-subtle)]" />
        <Skeleton className="h-[280px] w-full rounded-lg bg-[var(--color-border-subtle)]" />
      </div>
    )
  }

  return <PointsHistoryChart history={history} />
}
