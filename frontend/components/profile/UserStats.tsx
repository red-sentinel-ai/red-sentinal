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
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-md">
        <Skeleton className="mb-4 h-6 w-32 bg-gray-100" />
        <Skeleton className="h-[280px] w-full rounded-lg bg-gray-100" />
      </div>
    )
  }

  return <PointsHistoryChart history={history} />
}
