'use client'

import { motion } from 'framer-motion'
import { Gift, AlertCircle, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useRecipientRewards } from '@/hooks/rewards/useRecipientRewards'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { SUIVISION_TXBLOCK_URL, MIST_PER_SUI } from '@/constants'

export const RewardsHistory = () => {
  const { address } = useConnectedAddress()
  const { data, isLoading } = useRecipientRewards(address)

  const history = data?.result || []

  const totalRewards = history.reduce((acc, item) => acc + (item.rewardAmount || 0), 0)

  if (isLoading) {
    return (
      <Card className="border-[var(--color-border-subtle)] shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="text-[var(--color-text-primary)]">Rewards History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-12 w-full rounded-lg bg-[var(--color-border-subtle)]" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-6 text-[var(--color-text-primary)] shadow-[var(--shadow-card)]">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-[var(--color-text-muted)]">Total Earned</p>
          <div className="mt-1 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold tracking-tight">{totalRewards.toLocaleString()}</h3>
            <span className="text-sm font-bold text-[var(--color-gold-primary)]">SENTINEL</span>
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-bg-subtle)]">
          <Gift className="h-6 w-6 text-[var(--color-text-secondary)]" />
        </div>
      </div>

      <Card className="overflow-hidden border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] shadow-[var(--shadow-card)]">
        <CardHeader className="border-b border-[var(--color-border-subtle)] pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-[var(--color-text-primary)]">Activity History</CardTitle>
            <span className="rounded bg-[var(--color-bg-subtle)] px-2 py-1 text-xs text-[var(--color-text-muted)]">
              {data?.total || 0} Transactions
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {history.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <AlertCircle className="mx-auto mb-3 h-10 w-10 text-[var(--color-text-faint)]" />
              <p className="text-sm text-[var(--color-text-muted)]">No rewards history found for this account.</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border-subtle)]">
              <div className="hidden grid-cols-12 bg-[var(--color-bg-subtle)] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] md:grid">
                <div className="col-span-3">Reward</div>
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Time</div>
                <div className="col-span-2 text-right">Transaction</div>
              </div>

              {history.map((item, index) => {
                const linkDigest = item.transferDigest || item.txDigest
                const explorerLink = `${SUIVISION_TXBLOCK_URL.replace(/\/$/, '')}/${linkDigest}`

                return (
                  <motion.div
                    key={`${item.txDigest}-${item.eventSeq}-${index}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="grid grid-cols-1 items-center gap-2 px-4 py-4 transition-colors hover:bg-[var(--color-bg-subtle)] md:grid-cols-12 md:gap-y-0 md:px-6"
                  >
                    <div className="order-1 col-span-6 md:order-1 md:col-span-3">
                      <span className="inline-block text-sm font-bold text-[var(--color-gold-primary)]">
                        +{item.rewardAmount} SENTINEL
                      </span>
                    </div>

                    <div className="order-3 col-span-12 text-sm font-medium text-[var(--color-text-secondary)] md:order-2 md:col-span-5">
                      <p>{item.description}</p>

                      {item.eventType === 'AgentFunded' && item.metadata?.event?.amount && (
                        <p className="mt-0.5 text-xs font-normal text-[var(--color-text-muted)]">
                          Contributed:{' '}
                          {(Number(item.metadata.event.amount) / MIST_PER_SUI).toFixed(2)} SUI
                        </p>
                      )}

                      {item.metadata?.event?.agent_id && (
                        <p className="mt-0.5 font-mono text-[10px] text-[var(--color-text-faint)]">
                          Agent ID: {item.metadata.event.agent_id}
                        </p>
                      )}
                    </div>

                    <div className="order-2 col-span-6 text-right text-xs text-[var(--color-text-muted)] md:order-3 md:col-span-2 md:text-left">
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
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-info)]/5 px-3 py-1.5 text-xs font-medium text-[var(--color-info)] transition-colors hover:bg-[var(--color-info)]/10 hover:text-[var(--color-info)] hover:underline"
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
