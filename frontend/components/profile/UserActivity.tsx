/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import {
  Trophy,
  Clock,
  ExternalLink,
  Target,
  Zap,
  Shield,
  HandCoinsIcon,
  SwordsIcon,
  LockOpen,
} from 'lucide-react'
import { useState } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { SUI_TESTNET_BASE_URL } from '@/constants'
import { fromTokenUnits, truncateAddress } from '@/lib/utils'
import { usePromptConsumedEventsByWallet } from '@/hooks/events/usePromptConsumedEventsByWallet'

export const UserActivity = () => {
  const [activeTab, setActiveTab] = useState<'breaches' | 'attempts'>('breaches')
  const account = useCurrentAccount()
  const accountAddress = account?.address
  const { data: promptEvents, isLoading } = usePromptConsumedEventsByWallet(accountAddress)

  const formatTimestamp = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })

  const successfulBreaches = (promptEvents || []).filter((e) => e.success)
  const allAttempts = promptEvents || []
  const totalBounties = successfulBreaches.reduce(
    (sum, event) => sum + Number.parseInt(event.amount || '0') / 1e9,
    0
  )
  const successRate =
    allAttempts.length > 0
      ? ((successfulBreaches.length / allAttempts.length) * 100).toFixed(1)
      : '0'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          icon={LockOpen}
          label="Successful Breaches"
          value={successfulBreaches.length}
          color="text-green-400"
        />
        <StatsCard
          icon={SwordsIcon}
          label="Total Attacks"
          value={allAttempts.length}
        />
        <StatsCard
          icon={Trophy}
          label="Success Rate"
          value={`${successRate}%`}
          color="text-[#558EB4]"
        />
        <StatsCard
          icon={HandCoinsIcon}
          label="Bounties Earned"
          value={`${totalBounties.toFixed(4)} SUI`}
          color="text-yellow-400"
        />
      </div>

      <div className="flex justify-center">
        <div className="inline-flex bg-[#1a1b1f] border border-[#383838] rounded-full p-1 h-12">
          <button
            onClick={() => setActiveTab('breaches')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all duration-200 ${
              activeTab === 'breaches'
                ? 'bg-[#558EB4] text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="hidden sm:inline">Successful Breaches</span>
            <span className="sm:hidden">Breaches</span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${activeTab === 'breaches' ? 'bg-white/20' : 'bg-gray-600'}`}
            >
              {successfulBreaches.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('attempts')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all duration-200 ${
              activeTab === 'attempts'
                ? 'bg-[#558EB4] text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="hidden sm:inline">All Attack Attempts</span>
            <span className="sm:hidden">Attempts</span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${activeTab === 'attempts' ? 'bg-white/20' : 'bg-gray-600'}`}
            >
              {allAttempts.length}
            </span>
          </button>
        </div>
      </div>

      <div className="bg-[#12121266] border border-[#383838] rounded-xl overflow-hidden">
        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            {activeTab === 'breaches' && (
              <div>
                {successfulBreaches.length === 0 ? (
                  <EmptyState
                    icon={Zap}
                    title="No successful breaches yet"
                    description="Keep crafting prompts to break through agent defenses and earn bounties!"
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#1a1b1f] border-b border-[#383838]">
                        <tr>
                          <th className="text-left p-4 text-sm font-medium text-gray-400">
                            Breach
                          </th>
                          <th className="text-left p-4 text-sm font-medium text-gray-400">
                            Agent ID
                          </th>
                          <th className="text-left p-4 text-sm font-medium text-gray-400">
                            Bounty Earned
                          </th>
                          <th className="text-left p-4 text-sm font-medium text-gray-400">
                            Attack Score
                          </th>
                          <th className="text-left p-4 text-sm font-medium text-gray-400">Date</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-400">
                            Transaction
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {successfulBreaches.map((event, i) => (
                          <tr
                            key={event.txDigest}
                            className="border-b border-[#383838] hover:bg-[#1a1b1f]/50 transition-colors"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Zap className="size-4 text-green-400" />
                                <span className="font-medium text-green-400">Breach #{i + 1}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-mono text-sm text-gray-300">
                                {event.agent_id}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="font-semibold text-yellow-400">
                                {(Number.parseInt(event.amount || '0') / 1e9).toFixed(4)} SUI
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="w-12 bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-green-400 h-2 rounded-full"
                                    style={{ width: `${event.score}%` }}
                                  />
                                </div>
                                <span className="text-white text-sm">{event.score}/100</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-sm text-gray-400">
                                {formatTimestamp(event.timestamp)}
                              </span>
                            </td>
                            <td className="p-4">
                              <a
                                href={`${SUI_TESTNET_BASE_URL}/${event.txDigest}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[#558EB4] hover:text-[#1388D5] transition-colors"
                              >
                                <span className="font-mono text-xs">
                                  {truncateAddress(event.txDigest)}
                                </span>
                                <ExternalLink className="size-3" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'attempts' && (
              <div>
                {allAttempts.length === 0 ? (
                  <EmptyState
                    icon={Target}
                    title="No attack attempts yet"
                    description="Start your journey as a prompt engineer by attempting to break AI agent defenses."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#1a1b1f] border-b border-[#383838]">
                        <tr>
                          <th className="text-left p-4 text-sm font-medium text-gray-400">
                            Result
                          </th>
                          <th className="text-left p-4 text-sm font-medium text-gray-400">
                            Agent ID
                          </th>
                          <th className="text-left p-4 text-sm font-medium text-gray-400">
                            Attack Score
                          </th>
                          <th className="text-left p-4 text-sm font-medium text-gray-400">
                            Bounty
                          </th>
                          <th className="text-left p-4 text-sm font-medium text-gray-400">Date</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-400">
                            Transaction
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...allAttempts]
                          .sort(
                            (a, b) =>
                              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                          )
                          .map((event) => (
                            <tr
                              key={event.txDigest}
                              className="border-b border-[#383838] hover:bg-[#1a1b1f]/50 transition-colors"
                            >
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  {event.success ? (
                                    <>
                                      <Zap className="size-4 text-green-400" />
                                      <span className="font-medium text-green-400">
                                        Breach Success
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Shield className="size-4 text-red-400" />
                                      <span className="font-medium text-red-400">Defense Held</span>
                                    </>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="font-mono text-sm text-gray-300">
                                  {event.agent_id}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-12 bg-gray-700 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${event.success ? 'bg-green-400' : 'bg-red-400'}`}
                                      style={{ width: `${event.score}%` }}
                                    />
                                  </div>
                                  <span className="text-white text-sm">{event.score}/100</span>
                                </div>
                              </td>
                              <td className="p-4">
                                {event.amount && Number.parseInt(event.amount) > 0 ? (
                                  <span className="text-yellow-400 font-semibold">
                                    {fromTokenUnits(event.amount)} SUI
                                  </span>
                                ) : (
                                  <span className="text-gray-500">No bounty</span>
                                )}
                              </td>
                              <td className="p-4">
                                <span className="text-sm text-gray-400">
                                  {formatTimestamp(event.timestamp)}
                                </span>
                              </td>
                              <td className="p-4">
                                <a
                                  href={`${SUI_TESTNET_BASE_URL}/${event.txDigest}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[#558EB4] hover:text-[#1388D5] transition-colors"
                                >
                                  <span className="font-mono text-xs">
                                    {truncateAddress(event.txDigest)}
                                  </span>
                                  <ExternalLink className="size-3" />
                                </a>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const StatsCard = ({
  icon: Icon,
  label,
  value,
  color = 'text-white',
}: {
  icon: any
  label: string
  value: string | number
  color?: string
}) => (
  <div className="bg-[#1a1b1f] border border-[#383838] rounded-xl p-4">
    <div className="flex items-center gap-3">
      <div className="size-10 bg-[#558EB4]/20 rounded-lg flex items-center justify-center">
        <Icon className="size-5 text-[#558EB4]" />
      </div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className={`text-lg font-bold ${color}`}>{value}</p>
      </div>
    </div>
  </div>
)

const EmptyState = ({
  icon: Icon,
  title,
  description,
}: {
  icon: any
  title: string
  description: string
}) => (
  <div className="text-center py-12">
    <Icon className="size-16 mx-auto mb-4 text-gray-600" />
    <h3 className="text-lg font-semibold text-gray-300 mb-2">{title}</h3>
    <p className="text-gray-500">{description}</p>
  </div>
)

const LoadingState = () => (
  <div className="text-center py-12">
    <Clock className="size-16 mx-auto mb-4 text-gray-600 animate-spin" />
    <p className="text-gray-400">Loading your attack history...</p>
  </div>
)
