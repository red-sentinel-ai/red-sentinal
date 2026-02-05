'use client'

import { motion } from 'framer-motion'
import { Gift, AlertCircle, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useCurrentAccount } from '@mysten/dapp-kit'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useRecipientRewards } from '@/hooks/rewards/useRecipientRewards'
import { SUI_TESTNET_BASE_URL, MIST_PER_SUI } from '@/constants'

export const RewardsHistory = () => {
  const account = useCurrentAccount()
  const { data, isLoading } = useRecipientRewards(account?.address)

  const history = data?.result || []

  const totalRewards = history.reduce((acc, item) => acc + (item.rewardAmount || 0), 0)

  if (isLoading) {
    return (
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Rewards History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-12 w-full rounded-lg bg-gray-100" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 text-black shadow-md">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-gray-400">Total Earned</p>
          <div className="mt-1 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold tracking-tight">{totalRewards.toLocaleString()}</h3>
            <span className="text-sm font-bold text-[#F632F3]">SENTINEL</span>
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
          <Gift className="h-6 w-6 text-gray-600" />
        </div>
      </div>

      <Card className="overflow-hidden border-gray-200 bg-white shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-black">Activity History</CardTitle>
            <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
              {data?.total || 0} Transactions
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {history.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <AlertCircle className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">No rewards history found for this account.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <div className="hidden grid-cols-12 bg-gray-50 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 md:grid">
                <div className="col-span-3">Reward</div>
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Time</div>
                <div className="col-span-2 text-right">Transaction</div>
              </div>

              {history.map((item, index) => {
                const linkDigest = item.transferDigest || item.txDigest
                const explorerLink = `${SUI_TESTNET_BASE_URL.replace(/\/$/, '')}/${linkDigest}`

                return (
                  <motion.div
                    key={`${item.txDigest}-${item.eventSeq}-${index}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="grid grid-cols-1 items-center gap-y-2 px-4 py-4 transition-colors hover:bg-gray-50 md:grid-cols-12 md:gap-y-0 md:px-6"
                  >
                    <div className="order-1 col-span-6 md:order-1 md:col-span-3">
                      <span className="inline-block text-sm font-bold text-[#F632F3]">
                        +{item.rewardAmount} SENTINEL
                      </span>
                    </div>

                    <div className="order-3 col-span-12 text-sm font-medium text-gray-800 md:order-2 md:col-span-5">
                      <p>{item.description}</p>

                      {item.eventType === 'AgentFunded' && item.metadata?.event?.amount && (
                        <p className="mt-0.5 text-xs font-normal text-gray-500">
                          Contributed:{' '}
                          {(Number(item.metadata.event.amount) / MIST_PER_SUI).toFixed(2)} SUI
                        </p>
                      )}

                      {item.metadata?.event?.agent_id && (
                        <p className="mt-0.5 font-mono text-[10px] text-gray-400">
                          Agent ID: {item.metadata.event.agent_id}
                        </p>
                      )}
                    </div>

                    <div className="order-2 col-span-6 text-right text-xs text-gray-500 md:order-3 md:col-span-2 md:text-left">
                      {item.timestampMs
                        ? formatDistanceToNow(new Date(parseInt(item.timestampMs)), {
                            addSuffix: true,
                          })
                        : '-'}
                    </div>

                    <div className="order-4 col-span-12 text-right md:order-4 md:col-span-2">
                      {linkDigest && (
                        <a
                          href={explorerLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-800 hover:underline"
                        >
                          View TX <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
