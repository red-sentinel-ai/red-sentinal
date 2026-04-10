'use client'

import { useCurrentAccount } from '@mysten/dapp-kit'

import { Skeleton } from '@/components/ui/skeleton'
import { PointsHistoryChart } from '@/components/profile/PointsHistoryChart'
import { useRecipientRewards } from '@/hooks/rewards/useRecipientRewards'

export const UserStats = () => {
  const account = useCurrentAccount()
  const { data, isLoading } = useRecipientRewards(account?.address)

  const history = data?.result || []

  if (isLoading) {
    return (
      <div className="jp-card rounded-xl border p-6" style={{ backgroundColor: 'rgba(251, 231, 231, 0.5)', backdropFilter: 'blur(8px)', borderColor: 'var(--jp-dark-pink)' }}>
        <Skeleton className="mb-4 h-6 w-32" style={{ backgroundColor: 'var(--jp-light-pink)' }} />
        <Skeleton className="h-[280px] w-full rounded-lg" style={{ backgroundColor: 'var(--jp-light-pink)' }} />
      </div>
    )
  }

  return <PointsHistoryChart history={history} />
}
