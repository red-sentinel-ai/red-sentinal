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
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg bg-gray-100" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white text-black rounded-xl p-6 shadow-md flex justify-between items-center border border-gray-100">
        <div>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">
            Total Earned
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-bold tracking-tight">
              {totalRewards.toLocaleString()}
            </h3>
            <span className="text-sm font-bold text-green-500">SENTINEL</span>
          </div>
        </div>
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
          <Gift className="w-6 h-6 text-gray-600" />
        </div>
      </div>

      <Card className="border-gray-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl text-black">Activity History</CardTitle>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {data?.total || 0} Transactions
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {history.length === 0 ? (
            <div className="text-center py-12 px-4">
              <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No rewards history found for this account.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <div className="hidden md:grid grid-cols-12 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                    className="grid grid-cols-1 md:grid-cols-12 px-4 md:px-6 py-4 items-center hover:bg-gray-50 transition-colors gap-y-2 md:gap-y-0"
                  >
                    <div className="col-span-6 md:col-span-3 order-1 md:order-1">
                      <span className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm inline-block">
                        +{item.rewardAmount} SNTL
                      </span>
                    </div>

                    <div className="col-span-12 md:col-span-5 order-3 md:order-2 text-sm text-gray-800 font-medium">
                      <p>{item.description}</p>
                      
                      {item.eventType === 'AgentFunded' && item.metadata?.event?.amount && (
                        <p className="text-gray-500 text-xs mt-0.5 font-normal">
                          Contributed: {(Number(item.metadata.event.amount) / MIST_PER_SUI).toFixed(2)} SUI
                        </p>
                      )}
                      
                      {item.metadata?.event?.agent_id && (
                        <p className="text-gray-400 text-[10px] mt-0.5 font-mono">
                          Agent ID: {item.metadata.event.agent_id}
                        </p>
                      )}
                    </div>

                    <div className="col-span-6 md:col-span-2 order-2 md:order-3 text-right md:text-left text-xs text-gray-500">
                      {item.timestampMs 
                        ? formatDistanceToNow(new Date(parseInt(item.timestampMs)), { addSuffix: true })
                        : '-'
                      }
                    </div>

                    <div className="col-span-12 md:col-span-2 order-4 md:order-4 text-right">
                      {linkDigest && (
                        <a 
                          href={explorerLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          View TX <ExternalLink className="w-3 h-3" />
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