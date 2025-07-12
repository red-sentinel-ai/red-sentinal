'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Trophy, Clock, User, AlertCircle } from 'lucide-react'
import { useAgentEvents } from '@/hooks/useAgentEvents'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { SUI_TESTNET_BASE_URL } from '@/constants'

export default function UserProfileEvents() {
  const { events } = useAgentEvents()
  const account = useCurrentAccount()
  const [loading, setLoading] = useState(true)
  const [userEvents, setUserEvents] = useState({
    promptConsumed: [],
    agentDefeated: [],
  })

  const accountAddress = account?.address

  useEffect(() => {
    if (!account?.address || !events.promptConsumed || !events.agentDefeated) return

    setLoading(true)

    const filteredPrompts = events.promptConsumed.filter(
      (event) => event.parsedJson.sender === accountAddress
    )

    const filteredDefeated = events.agentDefeated.filter(
      (event) => event.parsedJson.winner === accountAddress
    )

    setUserEvents({
      promptConsumed: filteredPrompts,
      agentDefeated: filteredDefeated,
    })

    setLoading(false)
  }, [accountAddress, events])

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`
  const formatTimestamp = (ms: string) =>
    new Date(parseInt(ms)).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })

  const { promptConsumed, agentDefeated } = userEvents

  return (
    <div className="container max-w-4xl mx-auto px-4 py-20 space-y-10">
      <h1 className="text-3xl font-bold mb-6">📜 Your Activity</h1>

      {loading ? (
        <div className="text-center text-gray-400 py-20">
          <Clock className="w-10 h-10 mx-auto mb-4 animate-spin" />
          Loading your activity...
        </div>
      ) : (
        <>
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Agent Victories
            </h2>

            {agentDefeated.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                You haven’t defeated any agents yet.
              </div>
            ) : (
              <div className="space-y-4">
                {agentDefeated.map((event, i) => (
                  <div
                    key={`${event.id.txDigest}-${event.id.eventSeq}`}
                    className="bg-gray-800 rounded-lg p-4 border-l-4 border-yellow-500"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-green-400 font-semibold">Victory #{i + 1}</div>
                      <div className="text-sm text-gray-400">
                        {formatTimestamp(event.timestampMs)}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-400">Agent ID:</span>{' '}
                        <span>{event.parsedJson.agent_id}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Amount Won:</span>{' '}
                        <span className="text-green-400">
                          {(parseInt(event.parsedJson.amount_won || '0') / 1e9).toFixed(2)} SUI
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Score:</span>{' '}
                        <span>{event.parsedJson.score}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Tx:</span>{' '}
                        <a
                          href={`${SUI_TESTNET_BASE_URL}/${event.id.txDigest}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline font-mono"
                        >
                          {formatAddress(event.id.txDigest)}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Prompt Attempts
            </h2>

            {promptConsumed.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                No prompt attempts yet.
              </div>
            ) : (
              <div className="space-y-4">
                {[...promptConsumed]
                  .sort((a, b) => parseInt(b.timestampMs) - parseInt(a.timestampMs))
                  .map((event, i) => (
                    <div
                      key={`${event.id.txDigest}-${event.id.eventSeq}`}
                      className={`bg-gray-800 rounded-lg p-4 border-l-4 ${
                        event.parsedJson.success ? 'border-green-500' : 'border-red-500'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex gap-2 items-center">
                          {event.parsedJson.success ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                          <span
                            className={`font-medium ${
                              event.parsedJson.success ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {event.parsedJson.success ? 'Success' : 'Failed'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-400">#{promptConsumed.length - i}</span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div className="flex gap-2 items-center">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400">Sender:</span>
                          <span className="font-mono">
                            {formatAddress(event.parsedJson.sender)}
                          </span>
                        </div>

                        <div className="flex gap-2 items-center">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400">Time:</span>
                          <span>{formatTimestamp(event.timestampMs)}</span>
                        </div>

                        {event.parsedJson.amount && parseInt(event.parsedJson.amount) > 0 && (
                          <div>
                            <span className="text-gray-400">Amount:</span>
                            <span className="text-green-400 ml-2">
                              {(parseInt(event.parsedJson.amount) / 1e9).toFixed(2)} SUI
                            </span>
                          </div>
                        )}

                        <div>
                          <span className="text-gray-400">Tx:</span>
                          <a
                            href={`${SUI_TESTNET_BASE_URL}/${event.id.txDigest}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline ml-2 font-mono text-xs"
                          >
                            {formatAddress(event.id.txDigest)}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
