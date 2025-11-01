import { useMemo } from 'react'
import { CheckCircle, XCircle, Trophy, Clock, User, AlertCircle } from 'lucide-react'
import { useAgentEvents } from '@/hooks/useAgentEvents'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { formatAddress } from '@mysten/sui/utils'
import { SUI_TESTNET_BASE_URL } from '@/constants'

export const UserActivity = () => {
  const { events, loading } = useAgentEvents()
  const account = useCurrentAccount()
  const accountAddress = account?.address

  const userEvents = useMemo(() => {
    if (!accountAddress || !events.promptConsumed || !events.agentDefeated) {
      return {
        promptConsumed: [],
        agentDefeated: [],
      }
    }

    const filteredPrompts = events.promptConsumed.filter(
      (event) => event.parsedJson.sender === accountAddress
    )

    const filteredDefeated = events.agentDefeated.filter(
      (event) => event.parsedJson.winner === accountAddress
    )

    return {
      promptConsumed: filteredPrompts,
      agentDefeated: filteredDefeated,
    }
  }, [events.promptConsumed, events.agentDefeated, accountAddress])

  const formatTimestamp = (ms: string) =>
    new Date(parseInt(ms)).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })

  const { promptConsumed, agentDefeated } = userEvents

  return (
    <>
      {loading ? (
        <div className="text-center text-gray-500 py-20">
          <Clock className="w-10 h-10 mx-auto mb-4 animate-spin" />
          Loading your activity...
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-black">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Agent Victories
            </h2>

            {agentDefeated.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                You haven’t defeated any agents yet.
              </div>
            ) : (
              <div className="space-y-4">
                {agentDefeated.map((event, i) => (
                  <div
                    key={`${event.id.txDigest}-${event.id.eventSeq}`}
                    className="bg-white rounded-lg p-4 border-l-4 border-yellow-400 shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-green-600 font-semibold">Victory #{i + 1}</div>
                      <div className="text-sm text-gray-500">
                        {formatTimestamp(event.timestampMs)}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-800">
                      <div>
                        <span className="text-gray-500">Agent ID:</span>{' '}
                        <span>{event.parsedJson.agent_id}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Amount Won:</span>{' '}
                        <span className="text-green-600 font-medium">
                          {(parseInt(event.parsedJson.amount_won || '0') / 1e9).toFixed(2)} SUI
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Score:</span>{' '}
                        <span>{event.parsedJson.score}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Tx:</span>{' '}
                        <a
                          href={`${SUI_TESTNET_BASE_URL}/${event.id.txDigest}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-mono"
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

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-black">
              <Clock className="w-5 h-5 text-blue-500" />
              Prompt Attempts
            </h2>

            {promptConsumed.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
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
                      className={`bg-white rounded-lg p-4 border-l-4 shadow-sm ${
                        event.parsedJson.success ? 'border-green-500' : 'border-red-500'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex gap-2 items-center">
                          {event.parsedJson.success ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span
                            className={`font-medium ${
                              event.parsedJson.success ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {event.parsedJson.success ? 'Success' : 'Failed'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">#{promptConsumed.length - i}</span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-800">
                        <div className="flex gap-2 items-center">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-500">Sender:</span>
                          <span className="font-mono">
                            {formatAddress(event.parsedJson.sender)}
                          </span>
                        </div>

                        <div className="flex gap-2 items-center">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-500">Time:</span>
                          <span>{formatTimestamp(event.timestampMs)}</span>
                        </div>

                        {event.parsedJson.amount && parseInt(event.parsedJson.amount) > 0 && (
                          <div>
                            <span className="text-gray-500">Amount:</span>
                            <span className="text-green-600 font-medium ml-2">
                              {(parseInt(event.parsedJson.amount) / 1e9).toFixed(2)} SUI
                            </span>
                          </div>
                        )}

                        <div>
                          <span className="text-gray-500">Tx:</span>
                          <a
                            href={`${SUI_TESTNET_BASE_URL}/${event.id.txDigest}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline ml-2 font-mono text-xs"
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
        </div>
      )}
    </>
  )
}
